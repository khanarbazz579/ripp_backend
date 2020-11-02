const models = require('../models');
const Apps = models.analytic_apps;
const AppActivity = models.analytic_app_activities;
const bcrypt = require('bcrypt');

module.exports = class AnalyticsService {

    /**
     * Get application details as per the app id or user id
     * 
     * @param  {Number} options.user_id
     * @param  {String} options.type
     * @param  {String} options.app_id
     * @return {Object}
     */
    async getApp({ user_id, type, app_id }) {

        if (!app_id && !type) {
            throw new Error('This app is invalid!');
        }

        let where = {
            user_id: user_id
        };

        if (app_id) {
            where.id = app_id
        }

        const app = await Apps.findAll({
            where
        });

        if (!app.length) {
            throw new Error('You haven\'t added any websites to track at the moment!');
        }

        return type === 'all' ? app : app[0];
    }

    /**
     * Creates a new application with specified url and data.
     * 
     * @param  {Object} data
     * @return {Object}
     */
    async saveApp(data) {

        if (!data.url || data.url == '') {
            throw new Error('The target url is invalid!');
        }

        let salt = await bcrypt.genSalt(10);

        const hash = bcrypt.hashSync(Date.now() + data.email, salt);

        let exists = await Apps.findOne({
            where: {
                url: data.url
            }
        });

        if (exists) {
            throw new Error('An app with this URL already exists!');
        }

        return Apps.create({
            url: data.url,
            user_id: data.id,
            app_id: hash
        });
    }

    /**
     * Updates application
     * 
     * @param  {Object} data
     * @return {Object}
     */
    async updateApp(data) {

        if (data.id) {
            const app = await Apps.findOne({
                where: {
                    id: data.id,
                }
            });

            if (!app) {
                throw new Error('This is app is either invalid or doesn\'t exists!');
            }
            
            if(data.flag !== '') {
                app.status = data.flag;
                await app.save();
            }

            return app.reload();
        }

        if (!data.app_id) {
            throw new Error('This app is invalid!');
        }

        const app = await Apps.findOne({
            where: {
                app_id: data.app_id,
                url: {
                    $like: `%${data.url}%`
                }
            }
        });

        if (!app) {
            throw new Error('This is app is either invalid or doesn\'t exists!');
        }

        if (data.type === 'verify') {
            app.verified = true;
            await app.save();
        }

        return await app.reload();
    }

}