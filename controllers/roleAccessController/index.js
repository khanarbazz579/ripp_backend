const { updateParent, getUserByRoleId, getWithChildrens, findBy, create, update, destroy } = require('../../services/RoleAccessService'), { ROLES } = require('../../constants/permissions'),
    jwt = require('jsonwebtoken');
const { users, user_roles } = require('../../models');;

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
            res.statusCode = 422;
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


    const getParentId = async function (query, user) {
        let parentId = null;
        if (query.search) {
            const _searchUser = await users.findOne({
                where: {
                    $or: [{
                        first_name: {
                            $like: '%' + query.search + '%'
                        }
                    }, {
                        last_name: {
                            $like: '%' + query.search + '%'
                        }
                    }]
                },
                include: [{
                    model: user_roles,
                    as: 'role'
                }],
                raw:true
            });
            parentId = _searchUser && _searchUser['role.parent_id'];
        } else if (query.withUser) {
            parentId = user.role_id;
        }
        return parentId;
    }

    /**
     * Fetches role access
    */
    this.get = async function ({ query, user }, res, next) {
        const parentId = await getParentId(query, user);
        return getWithChildrens(parentId, query)
            .then(data => {
                return findBy({
                    id: user.role_id
                }, true)
                    .then(role => {
                        return { role, data }
                    })
            })
            .then(({ data, role }) => {
                role.isClose = false;
                role.isChecked = false;
                role.isManageable = true;
                role.childrens = data;
                role.users = [user];

                return _respond([null, query.withUser ? [role] : data], res)
            })
            .catch(err => {
                return _respond([err, null], res, '')
            });
    }

    /**
     * Creates new role access
     */
    this.save = async function (req, res, next) {
        let { body, user } = req;

        if (!body.parent_id) {
            let parent = await findBy({
                name: ROLES.ADMIN
            }, true);

            body.parent_id = parent.id
        }

        let data = await to(create({
            name: body.name,
            parent_id: body.parent_id,
            created_by: user.id
        }));

        return _respond(data, res, 'Role created successfully!');
    }

    /**
     * Updates role access provided role id
     */
    this.update = async function (req, res, next) {
        let { body, user, params } = req

        let data = await to(update({
            name: body.name,
            parent_id: body.parentId,
            id: params.id,
            reassign: body.reassign
        }));

        return _respond(data, res, 'Role updated successfully!');
    }

    /**
     * Updates role access parent id.
     */
    this.updateParent = async function (req, res) {
        const { body } = req;
        return _respond(
            await to(updateParent(body.data)),
            res,
            'Role parent updated successfully!'
        );
    }

    /**
     * Fetches user by role id
     */
    this.getUserByRoleId = async function ({ params }, res) {
        return _respond(
            await to(getUserByRoleId(params.role_id)),
            res,
            // 'User fetched successfully!'
        );
    }

    /**
     * Deletes role by role access id
     */
    this.destroy = async function (req, res, next) {
        let { params } = req;

        let data = await to(destroy({ id: params.id }));

        return _respond(data, res, 'Role deleted successfully!');
    }

    /**
     * Generates token for current users accessed by role access
     */
    this.getUserTokens = async function (req, res, next) {

        let { roleAccess } = req, tokens = {};

        let userData = await users.findAll({
            where: { id: { $in: roleAccess.users } },
            attributes: ['id', 'first_name'],
            raw: true
        });

        for (let i = 0; i < userData.length; i++) {
            userData[i].token = `Bearer ${jwt.sign({ user_id: userData[i].id }, CONFIG.jwt.encryption, { expiresIn: '5m' })}`;
        }

        return _respond([null, userData], res);
    }

    return this;

})()