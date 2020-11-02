const {
    getPermissionSets,
    updateUserPermissionSet,
    updatePermissionSet,
    savePermissionSets,
    deletePermissionSets
} = require('../../services/PermissionService');

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
            }).status(500);
        }

        return res.json({
            status: true,
            payload: list,
            message
        })
    }

    /**
     * Gets list of all permission sets.
     */
    this.getPermissionSets = async (req, res, next) => {
        let { query } = req;
        let response = await to(getPermissionSets(query));
        return _respond(response, res);
    }

    /**
     * Changes permission set attached to a user.
     */
    this.changePermissionSet = async (req, res, next) => {
        let response = await to(updateUserPermissionSet(req.body))
        return _respond(response, res, 'Permission set changed successfully!');
    }

    /**
     * Creates a new permission set.
     */
    this.savePermissionSets = async (req, res, next) => {
        const { body, user: { id } } = req;
        let response = await to(savePermissionSets(body, id));
        return _respond(response, res, 'Permission set added successfully!');
    };

    /**
     * Updates existing permission set/
     */
    this.updatePermissionSet = async (req, res, next) => {

        let body = {
            ...req.body,
            id: req.params.id
        };

        let response = await to(updatePermissionSet(body));
        return _respond(response, res, 'Permission set updated successfully!');
    }

    /**
     * Deletes a permission set.
     */
    this.deletePermissionSet = async (req, res, next) => {
        const body = {
            permission_id: Number(req.params.id),
            newId: req.query.newId
        }

        let response = await to(deletePermissionSets(body));
        return _respond(response, res, 'Permissions delete successfully!');
    }

    return this;

})()