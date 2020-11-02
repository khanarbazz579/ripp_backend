const UserService = require('../../services/AnalyticsUserService');

module.exports = (function () {

    const Service = new UserService;

    /**
     * Adapter for sending response depending on the response received from service layer.
     * 
     * @param {Array} param0 
     * @param {Object} res 
     * @param {string} message 
     * 
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
        });
    }

    /**
     * Get analytic app user
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.get = async (req, res, next) => {
        try {
            const { query } = req;

            let response = await Service.getUser(query);

            return _respond([null, response], res);

        } catch (err) {
            return _respond([err], res);
        }
    }

    /**
     * Synchronize data with browser
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.sync = async (req, res, next) => {
        try {
            const { body } = req;

            let response = await Service.synchronizeUserData(body);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res)
        }
    }

    /**
     * Update tracking data
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.update = async (req, res, next) => {
        try {
            const { params, body } = req;

            let response = await Service.update(params.id, body);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res)
        }
    }

    return this;

})()