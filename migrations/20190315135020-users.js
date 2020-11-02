'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('users',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "first_name": {
                    "type": "VARCHAR(191)"
                },
                "last_name": {
                    "type": "VARCHAR(191)"
                },
                "email": {
                    "type": "VARCHAR(191)",
                    "allowNull": true,
                    "unique": true,
                    "validate": {
                        "isEmail": {
                            "msg": "Email number invalid."
                        }
                    }
                },
                "password": {
                    "type": "VARCHAR(191)"
                },
                "birth_date": {
                    "type": "DATETIME"
                },
                "mobile": {
                    "type": "VARCHAR(191)"
                },
                "landline": {
                    "type": "VARCHAR(191)"
                },
                "profile_image": {
                    "type": "VARCHAR(191)"
                },
                "role_id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "user_roles",
                        "key": "id"
                    },
                    "onDelete": "NO ACTION",
                    "onUpdate": "CASCADE"
                },
                "is_deleted": {
                    "type": "TINYINT",
                    "allowNull": false,
                    "defaultValue": "0"
                },
                "allowed_space_aws": {
                    "type": "VARCHAR(191)",
                    "allowNull": false,
                    "defaultValue": 10737418240,
                    "comment": "10737418240 bytes = 10 GB"
                },
                "permission_set_id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "permission_sets",
                        "key": "id"
                    },
                    "onDelete": "NO ACTION",
                    "onUpdate": "CASCADE"
                },
                "created_at": {
                    "type": "DATETIME",
                    "allowNull": false
                },
                "updated_at": {
                    "type": "DATETIME",
                    "allowNull": false
                }
            })
        })

        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.dropTable('users');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};