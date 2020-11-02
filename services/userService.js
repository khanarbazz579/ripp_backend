const path = require('path');
const authService = require('../services/AuthService');
const rootFolderService = require('../services/rootFolderAwsService');
const db = require('../models');
const { password_resets, users, user_details } = db;
const sequelize = require('sequelize');
const { smtpTransport } = require('../services/awsSesSmtpTransport');
const multerS3UserProfile = require('../services/multerS3UserProfile');
const { updateIndividualPermissions } = require('./PermissionService');


module.exports = (function() {

    /**
     * Method to provide absctraction before passing data to user api - to hide unneccessary details from the end user
     * @param {User} param0 
     */
    let User = function({ id, email, first_name, last_name, mobile, job_title, fullName, is_deleted, allowed_space_aws, is_notification_check, updated_at, created_at, profile_image }) {
        return { id, email, first_name, last_name, job_title, fullName, is_deleted, allowed_space_aws, is_notification_check, updated_at, created_at, profile_image };
    }

    /**
     * Send mail to user email after successfull user creation
     * @param {object} user 
     * @param {headers} headers 
     * @param {string} user_token 
    **/
    let sendMailToUser = async(user, headers, user_token) => {

        var mailOptions = {
            to: user.email,
            from: 'no-reply@ripplecrm.com',
            subject: 'Ripple Admin - Password Request',
            text: 'Hello ' + user.first_name + ' \n\n' +
                ' You have been added to the CRM with ' + user.email + '.\n\n' +
                ' Follow this link to setup your account, or paste this into your browser to complete the process:\n\n' +
                headers.origin + '/create-password/' + user.first_name + '/' + user_token + '\n\n' +
                'The Ripple team'
        };

        return new Promise(function(resolve, reject) {

            const NODE_ENV = process.env.NODE_ENV_HEADER || process.env.NODE_ENV;
            /**
             * Added condition for dev mode to not send emails in development.
             */
            if (['test'].includes(NODE_ENV)) {
                resolve({ user: new User(user.toWeb()), token: user.getJWT() })
            } else {
                smtpTransport.sendMail(mailOptions, (err, resp) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve({ user: new User(user.toWeb()), token: user.getJWT() });
                    }
                }); 
            }       
        })

    }


    /**
     * Create a root AWS folder for user
     * @param {any} user 
     */
    let createRootFolderForUser = async(user) => {
        return await rootFolderService.createRootFolderForUser(user.email, user.id);
    }

    /**
     * Create a forget password token
     * @param {any} user 
     */
    let createPasswordResetToken = async(user, user_token) => {
        
        try {
            let resData = password_resets.create({
                email: user.email,
                token: user_token,
                generated: `${new Date().getTime()}`,
                expired_at: `${new Date(new Date().setHours(new Date().getHours() + 24)).getTime()}`
            });
            return await resData;
        } catch (err) {
            await password_resets.destroy({ where: { email: user.email } });
            createPasswordResetToken(user, user_token).catch(err => TE(err,'User Service > Error while generating token.'));
        }
    }

    /**
     * Method to add user without profile image
     * @param {object} body 
     * @param {headers} headers 
     */
    let addUser = async(body, headers) => {
        try {
            let user = await authService.createUser(body);
            let payload = null;
            let custom_permissions = {};
            if (user) {
                await createRootFolderForUser(user);
                if (body && body.user_custom_fields) {
                    let user_custom_fields = JSON.parse(body.user_custom_fields);
                    asyncForEach(user_custom_fields, async(field) => {
                        await insertDetail({
                            custom_field_id: field.custom_field_id,
                            field_value: field.field_value,
                            user_id: user.id,
                        });
                    })
                }
                let user_token = user.getForgetPasswordToken();
                let token = await createPasswordResetToken(user, user_token);

                if (body.permission_sets === 'undefined' && body.custom_permissions) {
                    custom_permissions = await updateIndividualPermissions({
                        userId: user.id,
                        data: JSON.parse(body.custom_permissions)
                    });
                }
                if (token) {
                    // console.log('token:...................: ', token);
                    payload = await sendMailToUser(user, headers, user_token);
                    // console.log('headers:+++++++++++ ', headers);
                }
            }
            return {...payload, ... { custom_permissions, message: 'Successfully created new user.' } };
        } catch (err) {
            TE(err);
        }
    }

    let uploadSingleImage = async(_id, file) => {
        return new Promise((resolve, reject) => {
            multerS3UserProfile.uploadSingleImage(file, {
                id: _id
            }, async(response) => {
                resolve(path.basename(response));
            }).catch(TE);
        });
    }

    let updateUser = async(id, body) => {
        try {
            /* 
            if (body.birth_date) {
                const dateParts = body.birth_date.split('/');
                const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                body.birth_date = date.toISOString();
            }
            */
           

            let user = await users.findByPk(id);
            if (user) {

                if (body.password && body.current_password) {
                    user = await user.comparePassword(body.current_password)
                        .catch(err => TE('Password is not valid'));
                }

                user = await user.set(body).save()
                    .catch(err => {
                        if (err.message == 'Validation error') err = 'The email address or phone number is already in use';
                        TE(err);
                    });

                    console.log("======>",body.user_custom_fields);
                   if(body.user_custom_fields){
                    let user_custom_fields = JSON.parse(body.user_custom_fields);
                    if (Array.isArray(user_custom_fields)) {
                        asyncForEach(user_custom_fields, async(field) => {
                            await insertDetail({
                                custom_field_id: field.custom_field_id,
                                field_value: field.field_value,
                                user_id: id,
                            });
                        })
                    }
                   }
                return { message: 'Updated User: ' + user.email, profile_image: (user && user.profile_image) };
            } else {
                return TE("user does not exist");
            }
        } catch (err) {
            return TE(err);
        };
    }

    let insertDetail = async(insertedData) => {
        return await user_details.findOrCreate({
            where: {
                custom_field_id: insertedData.custom_field_id,
                user_id: insertedData.user_id
            },
            defaults: insertedData
        }).spread(async(detailedObj, created) => {
            if (!created) {
                [err, detailObj] = await to(detailedObj.update(insertedData))
            }
        }).catch(TE);
    }


    /**
     * Method to add user with profile image to be save to s3 bucket and an save the path  to the server
     * @param {object} body 
     * @param {file} file 
     * @param {headers} headers 
     */
    let addUserWithImage = async(body, file, headers) => {
        try {
            let obj = await db.sequelize.query(`SHOW TABLE STATUS LIKE 'users'`, { type: db.sequelize.QueryTypes.SELECT })
            _id = (obj && obj[0] && obj[0].Auto_increment) ? Number(obj[0].Auto_increment) : 0;
            body.profile_image = await uploadSingleImage(_id, file);
            return await addUser(body, headers)
        } catch (err) {
            TE(err);
        }
    }

    /**
     * Service to create a user
     * @param {any} body
     */
    this.createUser = async(body, file, headers) => {
        try {
            if (file) {
                return await addUserWithImage(body, file, headers);
            } else {
                return await addUser(body, headers);
            }
        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Service method to get user data from its id
     * @param id user id
     * @returns user data
     */
    this.get = async(id) => {
        try {
            if (isNaN(Number(id))) return TE('Invalid user id!!');
            let userData = await users.findOne({
                where: { id },
                attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image', 'job_title', 'role_id', 'permission_set_id', 'mobile'],
                include: [{
                    model: user_details,
                    as: "user_details"
                }]
            });

            const { dataValues } = userData;
            return {
                ...dataValues,
                ... {
                    is_admin: await userData.isAdmin(),
                    permission_sets: dataValues.permission_set_id
                }
            };
        } catch (err) {
            return TE(err);
        }
    }

    this.update = async({ params: { _id }, body, file }) => {
        try {
            if (isNaN(Number(_id))) return TE('Invalid user id!!');
            if (file) {
                body.profile_image = await uploadSingleImage(_id, file);
                return await updateUser(_id, body);
            } else {
                return await updateUser(_id, body);
            }
        } catch (err) {
            return TE(err);
        }
    }

    return this;
})();