const models = require('../models'),
    { FIELD_PREFIX, SECTION_PREFIX } = require('../constants/permissions'),
    Users = models.users,
    UserHasPermissions = models.user_has_permissions,
    PermissionSets = models.permission_sets,
    Permissions = models.permission,
    UserHasPermissionSet = models.user_has_permission_sets,
    UserRoles = models.user_roles,
    PermissionSetHasPermissions = models.permission_sets_has_permissions;

let userAttributes = ['id', 'first_name', 'last_name', 'email', 'profile_image', 'job_title'];

module.exports = (function () {

    /**
     * Checks if a user has a permission set.
     * 
     * @param userId integer
     * @returns list object
     */
    this.userHasPermissionSet = async ({
        userId = 0
    }) => {
        let list = [];
        if (!userId) {
            return TE("No such user exists!")
        }

        try {
            list = await Users.findOne({
                where: {
                    id: userId
                },
                attributes: userAttributes,
                include: [{
                    model: models.user_has_permission_sets,
                    as: 'permission_set',
                    attributes: ['id', 'permission_set_id'],
                    include: [{
                        model: models.permission_sets,
                        attributes: ['name']
                    }],
                }]
            })
        } catch (err) {
            return TE(err);
        }

        return list;
    }

    /**
     * Query builder for filtering user's list according to given params.
     * 
     * @param filter object
     * @returns object
     */
    let _filterFactory = (filter) => {
        let user = {
            $and: []
        },
            permissionSet = {},
            roles = {},
            permission = {};

        if (filter.search && filter.search !== '') {
            user.$and.push({
                $or: [{
                    first_name: {
                        $like: '%' + filter.search + '%'
                    }
                }, {
                    last_name: {
                        $like: '%' + filter.search + '%'
                    }
                }, {
                    email: {
                        $like: '%' + filter.search + '%'
                    }
                }]
            })
        }

        if (filter.id && filter.id !== '') {
            user.$and.push({
                id: filter.id
            });
        }

        if (filter.permission_set_id && filter.permission_set_id !== '' && filter.permission_set_id > 0) {

            if (filter.permission_set_have_access === '1') {
                permissionSet.where = {
                    permission_set_id: filter.permission_set_id
                }
            } else {
                user.$and.push({
                    id: {
                        $notIn: models.sequelize.literal(`(SELECT u.id from users as u JOIN user_has_permission_sets as ups on ups.user_id = u.id WHERE ups.permission_set_id = ${filter.permission_set_id})`)
                    }
                });
            }

        }

        if (filter.permission_id && filter.permission_id !== '' && filter.permission_id > 0) {
            if (filter.permission_have_access === '1') {
                permission.where = {
                    permission_id: filter.permission_id
                };
            } else {
                user.$and.push({
                    id: {
                        $notIn: models.sequelize.literal(`(SELECT u.id from users as u JOIN user_has_permissions as ups on ups.user_id = u.id WHERE ups.permission_id = ${filter.permission_id})`)
                    }
                });
            }
        }

        if (filter.admin) {
            roles = {
                where: {
                    name: {
                        $eq: 'Admin'
                    }
                }
            }
        } else {
            roles = {
                where: {
                    name: {
                        $ne: 'Admin'
                    }
                }
            }
        }


        return { user, permissionSet, permission, roles };
    }

    /**
     * Gets lists of all users except for admin role; with filters as per incoming request.
     * 
     * @param filter object
     * @param session object
     * 
     * @returns users array
     * @throws err object
     */
    this.usersWithPermissionSets = async (filter, session = null) => {
        let users = [],
            { user, permission, permissionSet, roles } = _filterFactory(filter);

        // if (session) {
        //     user.$and.push({
        //         id: {
        //             $ne: session.id
        //         }
        //     });
        // }

        try {
            users = await Users.findAll({
                where: user,
                attributes: userAttributes,
                order: [
                    ['first_name', 'ASC']
                ],
                include: [{
                    model: models.user_has_permission_sets,
                    as: 'permission_set',
                    attributes: ['id', 'permission_set_id'],
                    include: [{
                        model: models.permission_sets,
                        attributes: ['name']
                    }],
                    ...permissionSet
                }, {
                    model: models.user_has_permissions,
                    as: 'permissions',
                    ...permission
                }, {
                    model: models.user_roles,
                    as: 'role',
                    ...roles
                }]
            });
        } catch (err) {
            return TE(err);
        }

        return users;
    }

    /**
     * Gets list of all permission sets, along with a filter functionality for searching by name.
     * 
     * @param query object
     *
     * @returns object
     * @throws err Exception
     */
    this.getPermissionSets = async (query) => {
        try {
            let options = {
                attributes: [
                    'id',
                    'name',
                    'description',
                    'created_at',
                    [models.sequelize.literal(`(SELECT COUNT(*) FROM user_has_permission_sets as u WHERE u.permission_set_id = permission_sets.id)`), 'userCount']
                ],
                include: [{
                    model: models.users,
                    as: 'owner',
                    attributes: userAttributes
                }, {
                    model: models.permission_sets_has_permissions,
                    as: 'permission',
                    attributes: ['id', 'permission_id', 'permission_set_id', 'access_type']
                }]
            };
            
            if (query.search && query.search !== '') {
                options.where = {
                    name: {
                        $like: '%' + query.search + '%'
                    }
                }
            }

            return await PermissionSets.findAll(options);
        } catch (err) {
            return TE(err);
        }
    }
    /**
     * Gets all permissions with different data adapters.
     * 
     * @param query object 
     * @returns permissions array
     * @throws err exception
     */
    this.getAllPermissions = async (query) => {

        try {
            let permissions = await Permissions.findAll({
                attributes: [['permission', 'title'], 'is_custom', 'parent_id', 'id', 'alternate_label'],
                // where:{
                //     is_custom: 0
                // },
                raw: true
            })

            if (query.type && query.type === 'nested') {
                permissions = await _getNestedPermissions(permissions);
            }

            if (query.type && query.type === 'tree') {
                permissions = await _getTreePermissions(permissions);
            }

            return permissions;

        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Adapter for transforming permissions to nested structure.
     * 
     * @param permissions array: List of all permissions
     * @param parent_id integer: Parent id of current set of permissions
     * 
     * @return currentLevel array
     */
    _getNestedPermissions = async (permissions, parent_id = null) => {
        let currentLevel = [];

        for (let i = 0; i < permissions.length; i++) {
            let regex = `([0-9]+$|${FIELD_PREFIX}|${SECTION_PREFIX})`
            permissions[i].title = permissions[i].title.replace(new RegExp(regex, 'gm'), '');

            if (permissions[i].parent_id === parent_id) {
                permissions[i].childs = await _getNestedPermissions(permissions, permissions[i].id);
                currentLevel.push(permissions[i]);
            }
        }

        return currentLevel;
    }

    /**
     * Adapter for transforming permissions to tree structure.
     * 
     * @param permissions array: List of all permissions
     * @param parent_id integer: Parent id of current set of permissions
     * 
     * @return currentLevel array
     */
    _getTreePermissions = async (permissions, parent_id = null) => {
        let currentLevel = [];

        for (let i = 0; i < permissions.length; i++) {
            let regex = `([0-9]+$|${FIELD_PREFIX}|${SECTION_PREFIX})`
            permissions[i].title = permissions[i].title.replace(new RegExp(regex, 'gm'), '');

            if (permissions[i].parent_id === parent_id) {

                currentLevel.push({
                    data: permissions[i],
                    children: await _getTreePermissions(permissions, permissions[i].id)
                });
            }
        }

        return currentLevel
    }

    /**
     * Updates permissions set active for the selected user
     * 
     * @param object: {userId: integer, permissionSetId: integer}
     * @returns object
     * @throws err Exception
     */
    this.updateUserPermissionSet = async ({ userId, permissionSetId }) => {

        try {

            if (!userId) {
                return TE('Invalid user!')
            }

            if (!permissionSetId) {
                return TE('No such permission set exists!');
            }

            let permission = await UserHasPermissionSet.findOne({
                where: { user_id: userId }
            });

            await UserHasPermissions.destroy({
                where: {
                    user_id: userId
                }
            })

            if (permission) {
                await UserHasPermissionSet.update({
                    permission_set_id: permissionSetId
                }, {
                        where: {
                            user_id: userId
                        }
                    });
            } else {
                [err, permission] = await to(UserHasPermissionSet.create({
                    user_id: userId,
                    permission_set_id: permissionSetId
                }));
            }

            return await this.userHasPermissionSet({ userId })
        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Updates individual permissions active for the selected user.
     * 
     * @param object {userId: integer, data:{access: object<access type>, permissions: array<List of permission's id>]}}
     * @returns user object
     * @throws err Exception
     */
    this.updateIndividualPermissions = async ({
        userId, data: { access, permissions }
    }, clear = true) => {
        try {

            if (!userId) {
                return TE('Cannot perform requested operation, invalid user!');
            }

            if(clear) {
                await UserHasPermissions.destroy({
                    where: {
                        user_id: userId
                    }
                })
            }

            await UserHasPermissionSet.destroy({
                where: {
                    user_id: userId
                }
            })

            for (let i = 0; i < permissions.length; i++) {


                let is_custom_permission = await Permissions.count({
                    where: {
                        id: permissions[i],
                        is_custom: true
                    }
                });

                let insert = {
                    user_id: userId,
                    permission_id: permissions[i]
                }

                if (is_custom_permission) {
                    insert.access_type = access[permissions[i]];
                    if (!access[permissions[i]]) {
                        return TE('Invalid permissions configurations, please try again!');
                    }

                    await _allowParentAccess(permissions[i], userId)

                }

                await UserHasPermissions.create(insert);
            }

            let user = await this.usersWithPermissionSets({
                id: userId,
                permission_set_id: '',
                permission_id: ''
            });

            return user.length ? user[0] : user;

        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Adds access to parent permissions for a given permission id.
     * 
     * @param {number} id Permission's id
     * @param {number} userId User's id
     */
    let _allowParentAccess = async (id, userId) => {
        let permission = await Permissions.findOne({
            where:{
                id: id
            },
            raw:true
        });
        
        if(permission) {
            await UserHasPermissions.upsert({
                user_id: userId,
                permission_id: permission.parent_id
            });
        }

        if(permission.parent_id > 0) {
            _allowParentAccess(permission.parent_id, userId);
        }

        return true;
    }

    /**
     * Gets permissions for a user.
     * 
     * @param {number} userId
     * @return {object} user
     * @throws err Exception
     */
    this.getUserPermissions = async ({ userId }) => {
        try {

            if (!userId || isNaN(userId)) {
                return TE('Cannot perform requested operation, invalid user!');
            }

            let permissions = await UserHasPermissions.findAll({
                where: {
                    user_id: userId
                },
                attributes: ['permission_id', 'access_type', 'id']
            })

            let data = {
                permissions: [],
                access: {}
            }

            for (let i = 0; i < permissions.length; i++) {
                data.permissions.push(permissions[i].permission_id);
                data.access[permissions[i].permission_id] = permissions[i].access_type
            }

            return data;

        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Permanently deletes a permission set and replaces existing permission set relations to new permission set.
     * 
     * @param {number} permission_id Permission id to be deleted
     * @param {number} newId Permission id to be applied to the users (optional)
     * 
     * @returns {boolean}
     * @throws {Exception} err
     */
    this.deletePermissionSets = async function ({ permission_id, newId }) {
        try {
            if (!permission_id || !Number.isInteger(permission_id)) {
                return TE('No such permission set exists!');
            }

            if (isNaN(newId)) {
                return TE('Permission set which is to be applied on the users, is found to be invalid!');
            }

            if (newId > 0) {
                let [err, success] = await to(UserHasPermissionSet.update({
                    permission_set_id: newId
                }, {
                        where: {
                            permission_set_id: permission_id
                        }
                    }));

                if (err) return TE(err);
            }

            await PermissionSetHasPermissions.destroy({
                where: {
                    permission_set_id: permission_id
                }
            })

            return await PermissionSets.destroy({
                where: {
                    id: permission_id
                }
            })
        } catch (err) {
            return TE(err);
        }
    };

    /**
     * Saves a permission set given permissions, access etc.
     * 
     * @param {string} name Name of the permission set
     * @param {stirng} description Permission set description (optional)
     * @param {array} permissions List of all permission ids
     * @param {object} access Key value pair for mapping permission to access type
     * @param {number} userId User id creating the permission set.

     * @returns {object}
     * @throws {Exception} err
     */
    this.savePermissionSets = async function ({ name, description, permissions, access }, userId) {

        try {
            if (!name) return TE('Permission set should have a valid name!');

            if (!permissions || (permissions && !permissions.length)) {
                return TE('There should be atleast one permission attached to this permission set');
            }

            let data = {
                name: name,
                description: description,
                created_by: userId
            };

            let set = await PermissionSets.create(data);
            await _bindPermissionToPermissionSet({ permissions, access, set });

            return this.getPermissionSet({
                id: set.id
            });
        } catch (err) {
            return TE(err);
        }
    };

    /**
     * Decorator to attach permissions to permission set.
     * 
     * @param {array} permissions List of permissions id
     * @param {object} access Key value pair for mapping permission to access type
     * @param {object} set Permission set to bind permissions to.
     * 
     * @returns {void}
     * @throws {Exception} err
     */
    let _bindPermissionToPermissionSet = async ({ permissions, access, set }) => {
        try {
            for (let i = 0; i < permissions.length; i++) {
                if (permissions[i] > 0) {

                    let is_custom_permission = await Permissions.count({
                        where: {
                            id: permissions[i],
                            is_custom: true
                        }
                    });

                    let insert = {
                        permission_set_id: set.id,
                        permission_id: permissions[i]
                    };

                    if (is_custom_permission) {
                        insert.access_type = access[permissions[i]];
                    }

                    await PermissionSetHasPermissions.create(insert);
                }
            }
        } catch (err) {
            TE(err);
        }
    }

    /**
     * Get a single permission set with permissions
     * 
     * @param {object} query Filters to be applied.
     * @returns {object} 
     * @throws {Exception} err
     */
    this.getPermissionSet = async (query) => {
        let where = {};
        if (query.id && query.id !== '') {
            where = {
                id: query.id
            }
        }

        try {
            return await PermissionSets.findOne({
                attributes: [
                    'id',
                    'name',
                    'description',
                    'created_at',
                    'created_by',
                    [models.sequelize.literal(`(SELECT COUNT(*) FROM user_has_permission_sets as u WHERE u.permission_set_id = permission_sets.id)`), 'userCount']
                ],
                where,
                include: [{
                    model: models.users,
                    as: 'owner',
                    attributes: userAttributes
                }, {
                    model: models.permission_sets_has_permissions,
                    as: 'permission',
                    attributes: ['id', 'permission_id', 'permission_set_id', 'access_type']
                }]
            });
        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Updates permission set and its permissions.
     * 
     * @param {name} string
     * @param {description} string
     * @param {permissionss} array<>
     * @param {access} object
     * @param {id} integer
     * 
     * @returns {permissionSet} object
     * @throws err Exception 
     */
    this.updatePermissionSet = async ({ name, description, permissions, access, id }, clear = true) => {

        try {

            if (isNaN(id)) {
                return TE('Invalid permission set Id!');
            }

            let permissionSet = await this.getPermissionSet({ id: id });

            if (!permissionSet) {
                return TE('No such permission set exists!');
            }

            if (!permissions || (permissions && !permissions.length)) {
                return TE('There should be atleast one permission attached to this permission set!')
            }

            if (name) {
                permissionSet.name = name;
            }

            if (description) {
                permissionSet.description = description;
            }

            permissionSet.save();

            if(clear) {
                await PermissionSetHasPermissions.destroy({
                    where: {
                        permission_set_id: id
                    }
                });
            }

            await _bindPermissionToPermissionSet({ permissions, access, set: permissionSet });
            return await this.getPermissionSet({ id: id });

        } catch (err) {
            return TE(err);
        }

    }

    return this;

})();

/**
 * Checks if the supplied user has access to a permission.
 * 
 * @param {array|string} permission Accepts array of permissions or single permission string
 * @param {object} user User object from request object
 * @param {string} access Access type of the permission (optional)
 * 
 * @throws {Error} 
 * @returns {false|array} returns false on no access or permissions array on access
 */
module.exports.havePermission = async ({ permission, user, access }) => {
    try {
        if (!Array.isArray(permission)) {
            permission = [permission];
        }

        permission = await Permissions.findAll({
            where: {
                permission: {
                    $in: permission
                }
            },
            raw: true
        });

        if (!permission.length) {
            return TE('Invalid permissions!');
        }

        let permission_ids = [];

        for (let i = 0; i < permission.length; i++) {
            permission_ids.push(permission[i].id);
        }

        permission_ids = permission_ids.join(',');

        let permissions = await models.sequelize.query(`SELECT PSHP.access_type, P.id, PSHP.permission_set_id, UHPS.user_id 
                FROM user_has_permission_sets as UHPS 
                JOIN permission_sets as PS ON PS.id = UHPS.permission_set_id
                JOIN permission_sets_has_permissions as PSHP ON PSHP.permission_set_id = PS.id
                JOIN permissions as P ON P.id = PSHP.permission_id
                WHERE UHPS.user_id = ${user.id} AND
                    P.id IN (${permission_ids})
            UNION
            SELECT UHP.access_type, P.id, 0 as permissons_set_id, UHP.user_id FROM user_has_permissions AS UHP
                JOIN permissions AS P ON P.id = UHP.permission_id
                WHERE UHP.user_id = ${user.id} AND 
                P.id IN (${permission_ids})`, {
                type: models.sequelize.QueryTypes.SELECT
            })

        if (permissions.length !== permission.length) {
            return false;
        }

        permissions = permissions[0]

        // if (access && access !== permissions.access_type) {
        //     return false;
        // }

        return permissions;
    } catch (err) {
        return TE(err);
    }
}

/**
 * Checks is the supplied user have the supplied role.
 * 
 * @param {string} role String equivalent of the role name
 * @param {object} user User object from request object.
 * 
 * @throws {Error} 
 * @returns {boolean} returns true when have role or false when doesn't.
 */
module.exports.haveRole = async ({ role, user }) => {
    try {

        let roleExists = await UserRoles.findAll({
            where: {
                name: role
            },
            raw: true
        });

        // if (!roleExists.length) {
        //     return TE('No such role is present!');
        // }

        let haveRole = await Users.count({
            where: {
                role_id: roleExists[0].id,
                id: user.id
            },
            raw: true
        });

        if (!haveRole) {
            return false;
        }

        return true;
    } catch (err) {
        return TE(err);
    }
}