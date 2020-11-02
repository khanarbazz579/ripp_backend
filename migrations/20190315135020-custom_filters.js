'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('custom_filters',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "allowNull": false,
                    "type": "VARCHAR(191)"
                },
                "user_id": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "references": {
                        "model": "users",
                        "key": "id"
                    },
                    "onDelete": "NO ACTION",
                    "onUpdate": "CASCADE"
                },
                "type": {
                    "type": "ENUM('1', '2', '3')",
                    "allowNull": false,
                    "defaultValue": "1",
                    "values": [
                        "1",
                        "2",
                        "3"
                    ],
                    "comment": "1 - Lead, 2 - Client, 3 - Supplier"
                },
                "priority_order": {
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "is_checked": {
                    "type": "TINYINT(1)",
                    "defaultValue": false,
                    "allowNull": false
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
            return queryInterface.dropTable('custom_filters');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};