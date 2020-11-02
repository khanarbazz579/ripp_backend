/**
 * Created by cis on 07/02/19.
 */
const EmailUser = require('../../models').email_users;
const EmailProvider = require('../../models').email_providers;
const MailerTokens = require('../../models').mailer_tokens;
const EmailSignature = require('../../models').email_signatures;
const path = require('path');
const EmailSyncService = require("./../../services/EmailSyncService");

const multerS3UserProfile = require('./../../services/multerS3UserProfile');


const getAll = async function(req, res) {
    let err, email_users, userDetails;
    const user_id = req.user.id;
    [err, email_users] = await to(
        EmailUser.findAll({
            where: {
                user_id: user_id
            },
            attributes: ['id', 'email_provider_id', 'email_user_name', 'email_host', 'email_port'],
            include: [{
                model: EmailProvider,
                attributes: ['email_provider_name']
            }]
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    if (email_users && email_users.length > 0) {
        let user = email_users[0].toJSON();
        let [emailUserError, emailUserDetails] = await EmailSyncService.getUserDetails(user);
        if (emailUserError) {
            emailUserError = emailUserError;
        }
        userDetails = {
            error: emailUserError,
            user: emailUserDetails
        }
    }
    return ReS(res, {
        email_users: email_users,
        user_details: userDetails
    }, 200);
};
module.exports.getAll = getAll;

const createEmailUsers = async function(req, res) {
    let additionalFieldObject = req.body;
    additionalFieldObject["user_id"] = req.user.id;
    let [errp, emailProviders] = await to(EmailProvider.findOne({
        where: { email_provider_name: 'Other Provider' }
    }));
    if (emailProviders) {
        emailProviders = emailProviders.toJSON();
    }
    additionalFieldObject.email_provider_id = emailProviders.id;
    let smtp = {
        email_provider_id: additionalFieldObject.email_provider_id,
        user_id: additionalFieldObject.user_id,
        email_user_name:  additionalFieldObject.email_user_name,
        email_user_password:additionalFieldObject.email_user_password,
        email_host:additionalFieldObject.email_host,
        email_port:additionalFieldObject.email_port,
        type:'SMTP',
        use_ssl:additionalFieldObject.use_ssl
    }

    let imap = {
         email_provider_id: additionalFieldObject.email_provider_id,
        user_id: additionalFieldObject.user_id,
        email_user_name:  additionalFieldObject.email_user_name,
        email_user_password:additionalFieldObject.email_user_password,
        email_host:additionalFieldObject.imap_email_host,
        email_port:additionalFieldObject.imap_email_port,
        type:'IMAP',
        use_ssl:additionalFieldObject.use_ssl
    }
    let err, UserEmailAdditionalField;
    [err, UserEmailAdditionalField] = await to(EmailUser.bulkCreate([smtp,imap]));
    if (err) return ReE(res, err, 422);
    return ReS(res, {
        UserEmailAdditionalField: UserEmailAdditionalField
    }, 200);
}

module.exports.createEmailUsers = createEmailUsers;


const updateEmailUsers = async function(req, res) {
    let err, emailUsers, emailUserId, emailUserObject;
    if (isNaN(parseInt(req.params.id)))
        return ReE(res, { success: false, message: 'It should have requested email user id.' }, 401);
    emailUserId = req.params.id;
    emailUserObject = req.body;
    [err, emailUsers] = await to(
        EmailUser.update(emailUserObject, {
            where: { id: emailUserId }
        })
    );
    if (err) {
        return ReE(res, err);
    }
    return ReS(res, {
        email_users: emailUsers
    });
}
module.exports.updateEmailUsers = updateEmailUsers;

const deleteEmailUsers = async function(req, res) {
    let email_users, err, emailUserId;
    let userId = req.user.id;
    if (req.params.id && isNaN(parseInt(req.params.id)))
        return ReE(res, { success: false, message: 'It should have requested email user id.' }, 401);

    emailUserId = req.params.id;
    [err, email_users] = await to(
        EmailUser.destroy({
            where: { user_id: userId }
        })
    );
    if (err) return ReE(res, 'error occured trying to delete email provider');
    return ReS(res, { message: 'Deleted email user.' }, 200);
}

module.exports.deleteEmailUsers = deleteEmailUsers;

const getEmailUserByID = async function(req, res) {
    let err, email_users, id1, userEmailObject;
    console.log('--->after change', req.params.id);
    if (isNaN(parseInt(req.params.id)))
        return ReE(res, { success: false, message: 'It should have requested provider id.' }, 401);

    id1 = parseInt(req.params.id);
    userEmailObject = req.body;
    console.log(typeof id1, id1);
    [err, email_users] = await to(
        EmailUser.findOne({
            //attributes: ['email_provider_id'],
            where: { id: id1 }
        })
    );

    if (err) {
        return ReE(res, err);
    }
    return ReS(res, {
        email_users: email_users
    });
};

//getMailerTokenStatus

// const getMailerTokenStatus = async function (req, res) {
//     const userName = req.body.graph_user_name;
//     let email_tokens;
//     [err, email_tokens] = await to(
//         MailerTokens.findAll({
//             where: { email_user: userName }
//         })
//     );

//     if (err) {
//         return ReE(res, err);
//     }
//     return ReS(res, {
//         email_tokens: email_tokens
//     });
// };

// //googleMailerController.generateRequest = async function(req, res) {
//     let parms = {};
//     const userName = req.body.graph_user_name;
//     const clearExistToken = await auth.clearToken(userName);
//     try {
//         if (clearExistToken) {
//             const isTokenRequest = await auth.createTokenRequest(userName);
//             if (isTokenRequest) {
//                 res.json({
//                     status: "Success",
//                     message: "Auth request successfully created.",
//                     url: await auth.getAccessUrl()
//                 });
//             } else {
//                 throw ({
//                     message: 'Error in request generate',
//                     error: {
//                         status: `Server_Error: Inetrnal server error.`
//                     }
//                 });
//             }
//         }
//     } catch (err) {
//         res.json(err);
//     }
// }


module.exports.getEmailUserByID = getEmailUserByID;
//module.exports.getMailerTokenStatus = getMailerTokenStatus



/**
 *
 * @param {*} req
 * @param {*} res
 * @description To uplaod signature file
 */
const createEmailSignature = async (req, res) => {
    let err, signature;
    let requestBody = req.body;
    let file_name;
    if (req.file) {
        if (requestBody.old_signature_file) {
            let path = `email-signatures/${requestBody.old_signature_file}`;
            let promise = await multerS3UserProfile.deleteProfileImageFromAws(path);
            if (promise) {
                console.log("++++++++++++++++++++ DELETED", promise)
            }
        }
        multerS3UserProfile.uploadSignatureFile(req.file, req.user.id, async (response) => {
            if (response) {
                file_name = path.basename(response);
                if (requestBody.id) {
                    c = await to(
                        EmailSignature.update({ file_path: file_name, file_name: req.file.originalname }, {
                            where: {
                                id: requestBody.id
                            }
                        })
                    );
                    if (err) {
                        return ReE(res, err, 422);
                    }
                } else {
                    [err, signature] = await to(
                        EmailSignature.create({
                            user_id: req.user.id,
                            file_path: file_name,
                            file_name: req.file.originalname
                        })
                    );
                    if (err) {
                        return ReE(res, err, 422);
                    }
                }
                return ReS(res, { file_name: file_name, message: "Signature file Uploaded." }, 200);
            }
        });
    } else {
        return res.json({ success: false, message: 'Something went wrong' });
    }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @description To fetch current user email signature
 */
const getAllFile = async function(req, res) {
    let err, email_signature;
    const user_id = req.user.id;
    [err, email_signature] = await to(
        EmailSignature.findOne({
            where: {
                user_id: user_id
            }
        })
    );
    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, {
        email_signature: email_signature
    }, 200);
};
module.exports.getAllFile = getAllFile;

/**
 * @param signatureFileId Number
 * @param req Object
 * @param res Object
 * @return ReS Function
 * @description To delete uploaded email signature file. 
 */

const deleteSignatureFile = async (req, res) => {
    if (req.params.id && isNaN(parseInt(req.params.id)))
        return ReE(res, { success: false, message: 'It should have requested email signature file id.' }, 401);
    let signatureFileId = req.params.id;
    let [err, signatureFile] = await to(
        EmailSignature.findOne({
            where: {
                id: signatureFileId
            }
        })
    );

    if (signatureFile) {
        signatureFile = signatureFile.toJSON();
        let path = `email-signatures/${signatureFile.file_path}`;
        let promise = await multerS3UserProfile.deleteProfileImageFromAws(path);
        if (promise) {
            console.log("++++++++++++++++++++ DELETED", promise)
        }
    }

    let [delError, signatureFileDetail] = await to(
        EmailSignature.destroy({
            where: { id: signatureFileId }
        })
    );

    if (delError) return ReE(res, 'error occured trying to delete email signature file');
    return ReS(res, { message: 'Email signature file deleted successfully.' }, 200);
}

module.exports.deleteSignatureFile = deleteSignatureFile;
module.exports.createEmailSignature = createEmailSignature;