const models = require('../models');
const bcrypt = require('bcrypt');
const { QueryTypes } = require('sequelize');
const { ANALYTICS } = require('../constants');

module.exports = class AnalyticsUserService {

    /**
     * Gets conbact attached to an email
     * @param {String} email 
     * 
     * @returns {Object}
     */
    async getUser({ email }) {

        const query = `SELECT * FROM contacts AS u JOIN leads_clients AS lc ON u.entity_id = lc.id WHERE u.email = '${email}'`;
        const users = await models.sequelize.query(query, { type: QueryTypes.SELECT });

        if (!users.length) {
            throw new Error('Cannot find this user!');
        }

        return users[0];
    }

    /**
     * Synchronizes data according to the collected data from the clients browser.
     * @param {Object} body 
     * 
     * @returns {Object}
     */
    async synchronizeUserData(body) {
        let users = [];
        if (body.email) {
            const query = `SELECT * FROM contacts AS u JOIN leads_clients AS lc ON u.entity_id = lc.id WHERE u.email = '${body.email}'`;
            users = await models.sequelize.query(query, { type: QueryTypes.SELECT });
        }

        let where = {
            where: {
                $or: [
                    {
                        browser_fingerprint: body.fingerprint
                    }, {
                        email: body.email || ''
                    }
                ]
            },
            include: ['activities']
        };

        if(body.analytic_app_user_id) {
            where.where.$or.push({
                id: body.analytic_app_user_id
            });
        }

        const tempUsers = await models.analytic_app_users.findOne(where);

        // if user found in user then map user to the temp analytics app user table
        if (!tempUsers) {
            return await models.analytic_app_users.create({
                analytic_app_id: body.app_id,
                browser_fingerprint: body.fingerprint,
                user_type: users.length ? users[0].entity_type : ANALYTICS.USERS.UNMAPPED,
                email: body.email,
                user_id: users.length ? users[0].id : null,
                last_active: Date.now(),
                active_time: 0,
                referrer: body.referrer || [],
                is_active: 1
            });
        }

        tempUsers.is_active = true;
        tempUsers.last_active = Date.now();

        if (tempUsers.email === '' && body.email !== '') {
            tempUsers.email = body.email
            tempUsers.referred_from = ANALYTICS.REFERRED.EMAIL
        }

        if(users.length) {
            tempUsers.user_id = users[0].id
        }

        if(body.referrer) {
            tempUsers.referrer = body.referrer;
        }

        await tempUsers.save();
        return tempUsers.reload();
    };

    /**
     * Updates user identified data according to the id
     * 
     * @param {Number} id 
     * @param {Object} data 
     * 
     * @returns {Object}
     */
    async update(id, data) {
        let where = {
            where: { id }
        };

        let analyticUser = await models.analytic_app_users.findOne(where);

        if (!analyticUser) {
            throw new Error('Cannot find this user!');
        }

        if (data.is_active === false) {
            let lastActive = analyticUser.dataValues.last_active;
            data.device = data.device ? data.device : 'Desktop';

            // All times in seconds
            if (lastActive) {

                let then = new Date(lastActive).getTime();
                let now = new Date(data.time).getTime();
                data.active_time = Number(analyticUser.dataValues.active_time) + Math.round((Number(now) - Number(then)) / 1000);

                let currentDeviceTime = 0;
                if(analyticUser.dataValues.device_active_time) {
                    currentDeviceTime = analyticUser.dataValues.device_active_time[data.device];
                }
               
                data.device_active_time = {
                    [data.device]: Number(currentDeviceTime) + Math.round((Number(now) - Number(then)) / 1000)
                }
                data.last_active = null;

            } else {
                data.last_active = new Date();
            }
        }

        let updated = await models.analytic_app_users.update(data, where);

        return await analyticUser.reload();
    }

    /**
     * Adds activity according to the identified user.
     * @param {Object} data 
     * 
     * @returns {Object}
     */
    async addActivity(data) {
        if (!data.analytic_app_user_id) {
            throw new Error('Invalid user!');
        }

        let userExists = await models.analytic_app_users.findOne({
            where: {
                id: data.analytic_app_user_id
            }
        });

        if (!userExists) {
            throw new Error('No such user exists!');
        }

        let exists = await models.analytics_app_activities.findOne({
            where: {
                analytic_app_user_id: data.analytic_app_user_id
            }
        });

        if (exists) {
            throw new Error('Cannot create activity for this user, already exists!');
        }

        let payload = {
            analytic_app_user_id: data.analytic_app_user_id,
            access_location: data.access_location,
            visits: data.visits || 1,
            pages_viewed: data.pages_viewed,
            access_device_raw: [data.access_device]
        }

        if(data.access_device) {
            payload.access_device = data.access_device.device.type;
        }
                                                                                                                                                                                                                                                                                                                                                                                                                    
        return await models.analytics_app_activities.create(payload);
    }

    /**
     * Updates existing activity of the user according to the ID
     * @param {Object} data 
     * 
     * @returns {Object}
     */
    async updateActivity(data) {
        if (!data.analytic_app_user_id) {
            throw new Error('Invalid activity id')
        }

        let userExists = await models.analytic_app_users.findOne({
            where: {
                id: data.analytic_app_user_id
            }
        });

        if (!userExists) {
            throw new Error('No such user exists!');
        }

        let activity = await models.analytics_app_activities.findOne({
            where: {
                analytic_app_user_id: data.analytic_app_user_id
            }
        });

        if (!activity) {
            throw new Error('No activity exists for this user!');
        }

        if(data.access_device && activity.access_device.indexOf(data.access_device.device.type) === -1) {
            activity.access_device = activity.access_device + ', ' + data.access_device.device.type;
            activity.access_device_raw.push(data.access_device);
        }

        if(data.pages_viewed ){
            activity.pages_viewed = data.pages_viewed;
        }

        if(data.visits) {
            activity.visits = (activity.visits || 0) + 1;
        }

        await activity.save();
        return await activity.reload();
    }

    /**
     * Gets activity as per user.
     * @param {Number} analytic_app_user_id 
     * 
     * @returns {Object}
     */
    async getActivity(analytic_app_user_id) {

        if(!analytic_app_user_id) {
            throw new Error('Invalid app user id!');
        }

        let userExists = await models.analytic_app_users.findOne({
            where: {
                id: analytic_app_user_id
            }
        });

        if(!userExists) {
            throw new Error('No such user exists!');
        }

        let activity = await models.analytics_app_activities.findOne({
            where: {
                analytic_app_user_id: analytic_app_user_id
            }
        });

        if(!activity) {
            throw new Error('No activity defined for this userat the moment!');
        }

        return activity;
    }

    /**
     * Saves form data linked to form id
     * 
     * @param  {Object} data
     * @return {Promise}
     */
    // async saveForm(data) {

    //     if(!data.form_id) {
    //         throw new Error('Form not specified!');
    //     }

    //     if(!data.form_values) {
    //         throw new Error('No data transferred!');
    //     }

    //     let form = models.forms.findOne({
    //         where: {
    //             form_id: data.form_id
    //         },
    //         raw: true
    //     });

    //     if(!form) {
    //         throw new Error('Invalid form!');
    //     }

    //     let payload = {};

    //     payload.form_id = parseInt(data.form_id);

    //     if(data.form_values) {
    //         payload.form_values = data.form_values;

    //         if(!Object.keys(data.form_values).length) {
    //             throw new Error('No data fields present!');
    //         }
    //     }

    //     if(data.analytic_app_user_id) {
    //         let app_user = await models.analytic_app_users.findOne({
    //             id: data.analytic_app_user_id
    //         });

    //         if(app_user) {
    //             payload.analytic_app_user_id = data.analytic_app_user_id;

    //             if(data.form_values.email && app_user.dataValues.email === '') {
    //                 app_user.email = data.form_values.email;
    //                 app_user.save();
    //             }
    //         }
    //     }

    //     return models.analytic_app_forms.create(payload);
    // }

}