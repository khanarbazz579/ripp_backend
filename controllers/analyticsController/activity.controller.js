const UserService = require('../../services/AnalyticsUserService');

module.exports = (function () {

    const Service = new UserService;

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
        });
    }

    /**
     * Gets activity for an identified user
     */
    this.get = async function (req, res, next) {
        try {

            let { query } = req;

            let response = await Service.getActivity(query.analytic_app_user_id);

            return _respond([null, response], res);

        } catch (err) {
            return _respond([err], res)
        }
    }

    /**
     * Creates a new activity for auser.
     */
    this.create = async function (req, res, next) {
        try {
            let { body } = req;

            let response = await Service.addActivity(body);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    }

    /**
     * Updates activity for a user.
     */
    this.update = async function (req, res, next) {
        try {
            let { body } = req;

            let response = await Service.updateActivity(body);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    }

    return this;

})();