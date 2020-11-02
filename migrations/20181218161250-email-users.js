'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
            .then(() => {
                return queryInterface.createTable('email_users',
                    {
                        "id": {
                            "type": "INTEGER",
                            "allowNull": false,
                            "primaryKey": true,
                            "autoIncrement": true
                        },
                        "email_provider_id": {
                            "type": "INTEGER"
                        },
                        "user_id": {
                            "type": "INTEGER"
                        },
                        "email_user_name": {
                            "type": "VARCHAR(300)"
                        },
                        "email_user_password": {
                            "type": "VARCHAR(500)"
                        },
                        "email_host": {
                            "defaultValue": null,
                            "type": "VARCHAR(300)"
                        },
                        "email_port": {
                            "defaultValue": null,
                            "type": "INTEGER"
                        },
                        "type": {
                            "defaultValue": null,
                            "type": "VARCHAR(500)"
                        },
                        "use_ssl": {
                            "defaultValue": false,
                            "type": "BOOLEAN"
                        },
                        "created_at": {
                            "type":  "DATETIME"
                        },
                        "updated_at": {
                            "defaultValue": null,
                            "type": "DATETIME"
                          },
                        
                    })
            })

            .then(() => {
                return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
            .then(() => {
                return queryInterface.dropTable('email_users');
            })
            .then(() => {
                return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            });
    }
};