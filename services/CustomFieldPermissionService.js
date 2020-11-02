const { FIELD_PREFIX, SECTION_PREFIX, FIELD_MAP } = require('../constants/permissions');
const { updateIndividualPermissions, updatePermissionSet } = require('../services/PermissionService');
const models = require('../models'),
    Permissions = models.permission,
    Users = models.users,
    UserHasPermissions = models.user_has_permissions,
    PermissionSetsHasPermissions = models.permission_sets_has_permissions,
    UserHasPermissionSet = models.user_has_permission_sets,
    CustomField = models.custom_fields;

module.exports = (function () {

    /**
     * Attached permissions to a custom field.
     * 
     * @param {object} field Custom field object
     * @param {array} users List of user ids to be attached
     * @param {array} sets List of permission set ids to be attached.
     * 
     * @throws {function} TE 
     * @returns {boolean} 
     */
    this.attachPermissions = async (field, { users, sets }, section) => {
        try {

            let permission = await Permissions.findOne({
                where: {
                    custom_field_id: field.id
                },
                raw: true
            });

            if (!permission) {
                let sectionPermission = await Permissions.findOne({
                    where: {
                        section_id: section.id
                    },
                    raw: true
                });

                permission = await Permissions.create({
                    permission: FIELD_PREFIX + field.label.toLowerCase() + ' ' + field.id,
                    alternate_label: sectionPermission.alternate_label + ' > ' + field.label.toLowerCase(),
                    custom_field_id: field.id,
                    is_custom: 1,
                    parent_id: sectionPermission.id
                });

                permission = permission.get({ plain: true })
            }

            await _clearPreviousPermissions(permission.id);

            if (users.length) {
                for (let i = 0; i < users.length; i++) {
                    updateIndividualPermissions({
                        userId: users[i].id,
                        data: {
                            access: {
                                [permission.id]: users[i].access_type
                            },
                            permissions: [permission.id]
                        }
                    }, false);
                }
            }

            if (sets.length) {
                for (let i = 0; i < sets.length; i++) {
                    updatePermissionSet({
                        permissions: [permission.id],
                        access: {
                            [permission.id]: sets[i].access_type
                        },
                        id: sets[i].id
                    }, false)
                }
            };

            return true;

        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Attached a permission to a section.
     * 
     * @param {object} section Section object
     * 
     * @throws {function} TE exception handler
     * @returns {object} Created permission
     */
    this.addSectionPermission = async (section) => {
        try {
            section = section.dataValues;

            let sectionPermission = await Permissions.count({
                where: {
                    section_id: section.id,
                    is_section: 1
                }
            });

            if (sectionPermission) {
                return [null, sectionPermission];
            }

            let where = {
                permission: FIELD_MAP[section.type] ? FIELD_MAP[section.type] : FIELD_MAP.DEFAULT
            };

            let secWrapper = await Permissions.findOne({ where, raw: true });

            if (secWrapper) {
                return await Permissions.create({
                    permission: SECTION_PREFIX + section.name.toLowerCase() + ' ' + section.id,
                    alternate_label: secWrapper.alternate_label + ' > ' + section.name.toLowerCase(),
                    section_id: section.id,
                    is_section: 1,
                    parent_id: secWrapper.id
                });
            }

        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Removes existing users and permission set mapping to the permission.
     * 
     * @param {number} permission_id 
     */
    let _clearPreviousPermissions = async (permission_id) => {
        await UserHasPermissions.destroy({
            where: {
                permission_id
            }
        })

        await PermissionSetsHasPermissions.destroy({
            where: {
                permission_id
            }
        })
    }

    /**
     * Get permissions and users attached to the custom field
     * 
     * @param {number} id Custom field id
     * @param {string} type
     * 
     * @throws {function} TE Exception handler
     * @returns {object}
     */
    this.customFieldPermissions = async ({ id }, type) => {
        try {
            if (isNaN(id) || !id) {
                return TE('Invalid custom field!');
            }

            let field = await CustomField.findAll({
                where: {
                    id: id
                },
                raw: true
            });

            if (!field.length) {
                return TE('No such custom field exists!');
            }

            let users = await Users.findAll({
                attributes: [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'profile_image'
                ],
                where: {
                    id: {
                        $or: [{
                            $in: models.sequelize.literal('(SELECT user_id from user_has_permissions AS uhp LEFT JOIN permissions p ON p.id = uhp.permission_id WHERE p.custom_field_id = ' + id + ")")
                        }, {
                            $in: models.sequelize.literal('(SELECT uhps.user_id from permission_sets_has_permissions AS psp LEFT JOIN permission_sets AS ps ON ps.id = psp.permission_set_id LEFT JOIN user_has_permission_sets AS uhps ON ps.id = uhps.permission_set_id LEFT JOIN permissions AS p ON p.id = psp.permission_id WHERE p.custom_field_id IS NOT NULL AND p.custom_field_id = ' + id + ')')
                        }]
                    }
                },
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
                    }]
                }]
            });

            let permission_sets = [];

            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                let isCustom = !user.permission_set, access;
                user.dataValues.isCustom = isCustom;

                if (isCustom) {
                    access = await models.sequelize.query('(SELECT access_type, permission_id from user_has_permissions AS uhp LEFT JOIN permissions p ON p.id = uhp.permission_id WHERE p.custom_field_id = ' + id + ' AND uhp.user_id = ' + user.dataValues.id + ')', { type: models.sequelize.QueryTypes.SELECT });
                } else {
                    access = await models.sequelize.query('(SELECT psp.access_type, psp.permission_set_id from permission_sets_has_permissions AS psp LEFT JOIN permission_sets AS ps ON ps.id = psp.permission_set_id LEFT JOIN user_has_permission_sets AS uhps ON ps.id = uhps.permission_set_id LEFT JOIN permissions AS p ON p.id = psp.permission_id WHERE p.custom_field_id IS NOT NULL AND p.custom_field_id = ' + id + ' AND uhps.user_id = ' + user.dataValues.id + ' )', { type: models.sequelize.QueryTypes.SELECT })
                }

                if (access[0] && access[0].access_type) {
                    user.dataValues.access_type = access[0].access_type;
                }
                if (access[0] && !isCustom) {
                    permission_sets.push({
                        id: access[0].permission_set_id,
                        access_type: access[0].access_type
                    });
                }

                user.dataValues.selected = 0;
                users[i] = user;
            }

            return { users, permission_sets };
        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Removes a user from the permission set
     * 
     * @param {number} userId User id
     * @throws {function} TE Exception handler
     * @returns {boolean}
     */
    this.removeUserFomPermissionSet = async ({ userId }) => {

        try {

            if (!userId.length) {
                return TE('Invalid user!');
            }

            await UserHasPermissionSet.destroy({
                where: {
                    user_id: {
                        $in: userId
                    }
                }
            });

            return true;
        } catch (err) {
            return TE(err);
        }
    }

    return this;
})();