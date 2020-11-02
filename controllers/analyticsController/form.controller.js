const UserService = require("../../services/AnalyticsUserService");
const BuilderService = require("../../services/FormBuilderService");

module.exports = (function () {
    const Service = new UserService();
    const builderService = new BuilderService();

    /**
     * Adapter for sending response depending on the response received from service layer.
     *
     * @param {Array} param0
     * @param {Object} res
     * @param {string} message
     * @return {JSON} res
     */
    let _respond = ([err, list], res, message = "") => {
        if (err) {
            return res
                .status(422)
                .json({
                    status: false,
                    message: err.message,
                })
                .status(500);
        }

        return res.json({
            status: true,
            payload: list,
            message,
        });
    };

    /**
     * Gets activity for an identified user
     */
    // this.get = async function (req, res, next) {
    //     try {
    //         let { query, params } = req;

    //         let response = await builderService.getForms();

    //         return _respond([null, response], res);
    //     } catch (err) {
    //         return _respond([err], res);
    //     }
    // };

    /**
     * Creates a new activity for a user.
     */
    this.create = async function (req, res, next) {
        try {
            let { body, user } = req;

            let response = await builderService.saveForm(body, user.id);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    };

    /**
     * Fetches all data
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.getAll = async function (req, res, next) {
        try {
            let { query } = req;
            if (query.data) {
                query = JSON.parse(query.data);
            }

            let response = await builderService.getForms(query);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    };

    /**
     * Updates the form
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.update = async function (req, res, next) {
        try {
            let { body, params } = req;

            let response = await builderService.updateForm(params.id, body);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    };

    /**
     * Get user for typeahead
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.getUsers = async function (req, res, next) {
        try {
            let { query } = req;

            if (query.data) {
                query = JSON.parse(query.data);
            }

            let response = await builderService.searchUsers(query);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    };

    /**
     * Gets initial data for form builder
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.getInitData = async function (req, res, next) {
        try {
            let { query } = req;
            let response = await builderService.getInitData(query);
            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    };

    this.destroy = async function(req, res, next) {
        try {
            let { params } = req;
            let response = await builderService.destroy(params.id);
            return _respond([null, response], res, 'Form deleted successfully!');
        } catch (err) {
            return _respond([err], res);
        }
    }

    return this;
})();
