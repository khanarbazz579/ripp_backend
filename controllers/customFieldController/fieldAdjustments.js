const { getUsers, getAdmins } = require('../../services/RecordSharingService'),
    { getPermissionSets } = require('../../services/PermissionService'),
    { customFieldPermissions } = require('../../services/CustomFieldPermissionService');


module.exports = (() => {

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
     * Serves stream of rows as per request
     * 
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * 
     * @returns {json}
     * @throws {Error} 
     */
    this.stream = async (req, res, next) => {
        let { query, user, params } = req, response;

        query = JSON.parse(query.data);
        console.log('query:>>>>>>> ', query);

        switch (params.type) {
            case 'users':
                response = await to(getUsers(query, user));
                break;

            case 'permission_sets':
                response = await to(getPermissionSets(query));
                break;

            case 'admins':
                response = await to(getAdmins(query));
                break;
            default:
                return res.json({
                    status: false,
                    message: 'Invalid request!'
                })
                break;
        }

        return _respond(response, res);
    }

    /**
     * Gets all permissions for a field.
     * 
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * 
     * @returns {json}
     * @throws {Error} 
     */
    this.fieldPermissions = async (req, res, next) => {
        let { query } = req;
        query = JSON.parse(query.data);

        let [err, response] = await to(customFieldPermissions(query));

        return _respond([err, response], res);
    }

    /**
     * Removes a user from a permission set.
     * 
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * 
     * @returns {json}
     * @throws {Error} 
     */
    this.removeUserFromSet = async (req, res, next) => {
        let { query } = req;
        query = JSON.parse(query.data);

        let response = await to(removeUserFomPermissionSet(query));
        return _respond(response, res, 'User successfully removed from the permission set!');
    }

    return this;

})();