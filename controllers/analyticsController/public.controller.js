const UserService = require("../../services/AnalyticsUserService");
const BuilderService = require("../../services/FormBuilderService");

module.exports = (function () {

    const Service = new UserService;
    const builderService = new BuilderService;

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
     * Public api to get form data
     * 
     * @param  {Request}      req  
     * @param  {Response}     res  
     * @param  {Function}     next 
     * @return {Function}        
     */
    this.getForm = async function (req, res, next) {
        try {
            let { query } = req;

            let response = await builderService.getPublicForm(query);
            if(response.type === 'NEW') {
                await builderService.updateForm(response.id, {
                    verified: true,
                });
            }

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    };

    /**
     * Updates form mapping buffer.
     * 
     * @param  {Request}      req  
     * @param  {Response}     res  
     * @param  {Function}     next 
     * @return {Function}        
     */
    this.updateFormMappings = async function (req, res, next) {
        try {
            let { body, params } = req;
            let response = await builderService.updateForm(params.id, {
                field_mapping_buffer: body,
                verified: true,
            });

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    };

    /**
     * Saves form submission values
     * 
     * @param  {Object}   req
     * @param  {Object}   res
     * @param  {Function} next
     * 
     * @return {Function}
     */
    this.saveFormValues = async function(req, res, next) {
        try {
            let { body } = req;
            let response = await builderService.saveFormValues(body);

            return _respond([null, response], res);
        } catch (err) {
            return _respond([err], res);
        }
    }

    return this;

})();