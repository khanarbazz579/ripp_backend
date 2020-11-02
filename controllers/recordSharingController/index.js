const { getUsers, updateSharedHistory, getSharedOwners, updateOwner, getSharedUsersCount } = require('../../services/RecordSharingService');

module.exports = (function () {

    /**
     * 
     * @param {Array} param0 
     * @param {Object} res 
     * @param {string} message 
     * 
     * @return {JSON} res
     */
    let _respond = ([err, list], res, message = '', code) => {
        if (err) {
            res.status(code ? code : 422);
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
     * 
     * @param {string} query 
     * @param {Object} user 
     * @param {object} params 
     * @param {Object} res
     * 
     * @return {JSON} res
     */
    this.stream = async ({ query, user, params }, res, next) => {
        let response;
        switch (params.type) {

            case 'users':
                response = await to(getUsers(query, user));
                break;
            default:
                return _respond([{ message: 'Invalid request!' }, null], res);
        }

        return _respond(response, res);
    }

    /**
    * 
    * @param {Object} body 
    * @param {Object} res
    * 
    * @return {JSON} res
    */
    this.create = async ({ body }, res, next) => {
        return _respond(await to(updateSharedHistory(body)), res, 'Updated Successfully.');
    }

    /**
     * 
     * @param {Object} body 
     * @param {Object} res
     * 
     * @return {JSON} res
     */
    this.updateOwner = async ({ body }, res, next) => {
        return _respond(await to(updateOwner(body)), res, 'Updated Successfully.');
    }

    /**
     * 
     * @param {Object} lead_id 
     * @param {number} contact_id
     * 
     * @return {JSON} res
     */
    this.getSharedUsersByLeadId = async ({ params: { lead_id, contact_id } }, res, next) => {
        let response;
        switch (true) {
            case (!isNaN(Number(lead_id))):
                response = await to(getSharedOwners(lead_id, contact_id));
                break;
            default:
                return _respond([{ message: 'Invalid request!!!' }, null], res, 422);
        }

        return _respond(response, res);
    }

    /**
    * 
    * @param {Object} lead_id 
    * @param {Number} id
    * @param {string} fullName
    * @param {string} email
    * @param {Object} res
    * 
    * @return {JSON} res
    * @throws err exception
    */
    this.getSharedUsersCountByLeadId = async ({ params: { lead_id }, user: { fullName, id, email } }, res, next) => {
        try {
            const users = await getSharedUsersCount(lead_id);
            return ReS(res, {
                count: (users.length) ? users.length : 0,
                users,
                loggedInUser: { fullName, id, email }
            }, 200);
        } catch (err) {
            return ReS(res, err.message, 422);
        }
    }

    return this;
})();