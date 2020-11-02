const AnalyticsService = require('../../services/AnalyticsService');

module.exports = (function () {

    const Service = new AnalyticsService;

    /**
     * Adapter for sending response depending on the response received from service layer.
     * 
     * @param {Array} param0 
     * @param {Object} res 
     * @param {string} message 
     * @return {JSON} res
     */
    let _respond = ([err, list], res, message = '') => {

        if (err) {
            return res.status(422).json({
                status: false,
                message: err.message
            });
        }

        return res.json({
            status: true,
            payload: list,
            message
        })
    }

    /**
     * Gets the application data for the current application active
     * 
     * @param  {Object} req
     * @param  {Object} res
     * @param  {Function} next
     * @return {Function}
     */
    this.get = async (req, res, next) => {
        try {
            const { user, query } = req;

            let response = await Service.getApp({
                user_id: user.id,
                ...query
            });

            return _respond([null, response], res);

        } catch (err) {
            return _respond([err], res);
        }
    }

    /**
     * Saves the new application with a specified URL
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.save = async (req, res, next) => {
        try {
            const { body, user } = req;

            let response = await Service.saveApp({
                ...body,
                email: user.email,
                id: user.id
            });

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    }

    /**
     * Updates the existing application 
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.update = async (req, res, next) => {
        try {
            const { body, user } = req;
            let response = await Service.updateApp(body);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    }

    return this;

})()