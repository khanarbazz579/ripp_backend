'use strict';
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ROLES } = require('../constants/permissions');

module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('users', {
        first_name: {
            type: DataTypes.STRING(191),
            field: 'first_name'
        },
        last_name: {
            type: DataTypes.STRING(191),
            field: 'last_name'
        },
        email: {
            type: DataTypes.STRING(191),
            allowNull: true,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Email number invalid."
                }
            }
        },
        password: DataTypes.STRING(191),
        birth_date: {
            type: DataTypes.DATE,
        },
        mobile: {
            type: DataTypes.STRING(191),
        },
        landline: {
            type: DataTypes.STRING(191),
        },
        profile_image: {
            type: DataTypes.STRING(191)
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: '0'
        },
        allowed_space_aws: {
            type: DataTypes.STRING(191),
            allowNull: false,
            defaultValue: 10737418240,
            comment: '10737418240 bytes = 10 GB'
        },
        permission_set_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        job_title: {
            type: DataTypes.STRING(191),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(256),
            allowNull: true
        },
        idle_session_time_out: {
            type: DataTypes.TIME,
            allowNull: true
        },
        is_secure_access:{
            type: DataTypes.BOOLEAN,
            allowNull:true
        }
    }, {
        underscored: true,
        getterMethods: {
            fullName() {
                let firstName = this.getDataValue('first_name');
                let lastName = this.getDataValue('last_name');

                return firstName + " " + lastName;
            }
        },
    });

    Model.associate = function (models) {
        this.hasOne(models.user_has_permission_sets, {
            foreignKey: "user_id",
            targetKey: "id",
            as: "permission_set",
            onDelete: "cascade"
        });

        this.belongsTo(models.user_roles, {
            foreignKey: "role_id",
            targetKey: "id",
            as: "role"
        });
        this.belongsTo(models.accounts, {
            foreignKey: "account_id",
            targetKey: "id",
            as: "account"
        });

        this.hasMany(models.user_has_permissions, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: 'permissions',
            onDelete: "CASCADE"
        });

        this.hasMany(models.user_details, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: "user_details",
            onDelete: "CASCADE"
        });
    };

    Model.beforeSave(async (user, options) => {
        let err;
        if (user.changed('password')) {
            let salt, hash;

            [err, salt] = await to(bcrypt.genSalt(10));
            if (err) TE(err.message, true);

            [err, hash] = await to(bcrypt.hash(user.password, salt));
            if (err) TE(err.message, true);

            user.password = hash;
        }
    });

    Model.prototype.comparePassword = async function (pw) {
        let err, pass;
        if (!this.password) TE('password not set');

        [err, pass] = await to(bcrypt_p.compare(pw, this.password));
        if (err) TE(err);

        if (!pass) TE('Invalid password');

        return this;
    };

    Model.prototype.getJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt.expiration);
        return "Bearer " + jwt.sign({ user_id: this.id }, CONFIG.jwt.encryption, { expiresIn: '365d' });
    };

    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    Model.prototype.getForgetPasswordToken = function () {
        return crypto.createHash('md5').update(new Date().toString()).digest("hex");
    };

    /**
     * Checks is current user is an admin
     */
    Model.prototype.isAdmin = function () {

        return sequelize.query("SELECT count(*) as count FROM user_roles WHERE id = " + this.role_id + " AND name = '" + ROLES.ADMIN + "'", {
            type: sequelize.QueryTypes.SELECT
        })
            .then(role => {
                if (role[0].count) {
                    return true;
                }

                return false;
            })
            .catch(TE);
    };

    const typeQuery = "(CASE WHEN is_custom = 1 THEN 'CUSTOM_FIELD' WHEN is_section = 1 THEN 'SECTION' ELSE 'NO_TYPE' END)";

    /**
     * Fetches all permissions attached to a user.
     */
    Model.prototype.getPermissions = function () {
        return sequelize.models.permission.findAll({
            attributes: [
                'permission',
                'id',
                [sequelize.literal(typeQuery), 'type']
            ],
            where: {
                id: {
                    $in: sequelize.literal(`(SELECT permission_id FROM user_has_permissions WHERE user_id = ${this.id})`, {
                        type: sequelize.QueryTypes.SELECT
                    })
                }
            },
            include: [{
                model: sequelize.models.custom_fields,
                attributes: ['table_name', 'model_name', 'id', 'type']
            }, {
                model: sequelize.models.sections,
                attributes: ['name', 'id', 'type']
            }, {
                model: sequelize.models.user_has_permissions,
                attributes: ['access_type'],
                where: {
                    user_id: this.id
                }
            }],
        })
            .then(docs => {
                let permissions = {};
                for (let i = 0; i < docs.length; i++) {
                    let permission = docs[i].dataValues,
                        access_type = permission.user_has_permissions[0] ? permission.user_has_permissions[0].access_type : null;
                    delete permission.user_has_permissions;

                    permissions[permission.permission] = {
                        ...permission,
                        access_type
                    }
                }
                return permissions;
            })
            .catch(TE)
    }

    /**
     * Fetches all permissions from a permission set.
     */
    Model.prototype.getPermissionsFromSet = function () {
        return sequelize.models.permission.findAll({
            attributes: [
                'permission',
                'id',
                [sequelize.literal(typeQuery), 'type']
            ],
            where: {
                id: {
                    $in: sequelize.literal(`(SELECT PSHP.permission_id FROM permission_sets_has_permissions PSHP
                         JOIN user_has_permission_sets UHPS ON PSHP.permission_set_id = UHPS.permission_set_id 
                         WHERE UHPS.user_id = ${this.id})`, {
                        type: sequelize.QueryTypes.SELECT
                    })
                }
            },
            include: [{
                model: sequelize.models.custom_fields,
                attributes: ['table_name', 'model_name', 'id', 'type']
            }, {
                model: sequelize.models.sections,
                attributes: ['name', 'id', 'type']
            }, {
                model: sequelize.models.permission_sets_has_permissions,
                attributes: ['access_type']
            }],
        })
            .then(docs => {
                let permissions = {};
                for (let i = 0; i < docs.length; i++) {
                    let permission = docs[i].dataValues,
                        access_type = permission.permission_sets_has_permissions[0] ? permission.permission_sets_has_permissions[0].access_type : null;
                    delete permission.permission_sets_has_permissions;

                    permissions[permission.permission] = {
                        ...permission,
                        access_type
                    }
                }
                return permissions;
            })
            .catch(TE)
    }

    Model.prototype.getPermissionSet = function () {

        return sequelize
            .query('SELECT PS.id, PS.name, PS.is_custom, PS.description FROM user_has_permission_sets as UHPS JOIN permission_sets as PS on UHPS.permission_set_id = PS.id WHERE UHPS.user_id = ' + this.id, {
                type: sequelize.QueryTypes.SELECT
            })
            .then(docs => {
                if (docs.length) {
                    return docs[0];
                } else {
                    return {};
                }
            })
            .catch(TE)
    }

    Model.prototype.getRole = function () {
        return sequelize.models.user_roles.findOne({
            where: {
                id: this.role_id
            },
            attributes: ['id', 'name', 'parent_id']
        })
    }


    return Model;
};
