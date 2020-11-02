const { usersWithPermissionSets, getAllPermissions, getUserPermissions } = require('../../services/PermissionService');

module.exports = (function () {

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
            return res.json({
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
     * Gets users with permission sets.
     */
    this.getUsers = async (req, res, next) => {
        const { query } = req;
        let response = await to(usersWithPermissionSets(query, req.user));

        return _respond(response, res);
    }

    /**
     * Gets list of all permissions.
     */
    this.getAllPermissions = async (req, res, next) => {
        let response = await to(getAllPermissions(req.query));
        return _respond(response, res);
    }

    /**
     * Saves permissions for a user.
     */
    this.saveIndividualUserPermissions = async (req, res, next) => {
        let response = await to(updateIndividualPermissions(req.body))
        return _respond(response, res, 'Permissions saved successfully!');
    }

    /**
     * Gets list of all permissions attached to a user.
     */
    this.getIndividualUserPermissions = async (req, res, next) => {
        let response = await to(getUserPermissions(req.params))
        return _respond(response, res);
    }

    return this;

})()