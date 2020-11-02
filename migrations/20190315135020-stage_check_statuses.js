'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('stage_check_statuses',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "stage_id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "sales_stages",
                        "key": "id"
                    },
                    "onDelete": "CASCADE",
                    "onUpdate": "CASCADE"
                },
                "user_id": {
                    "type": "INTEGER",
                    "allowNull": false
                },
                "is_checked": {
                    "type": "TINYINT(1)",
                    "allowNull": false
                },
                "type": {
                    "type": "ENUM('0', '1', '2', '3')",
                    "allowNull": false,
                    "defaultValue": "1",
                    "values": [
                        "0",
                        "1",
                        "2",
                        "3"
                    ],
                    "comment": "0 - User, 1 - Lead , 2 -Client , 3-Supplier"
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
            return queryInterface.dropTable('stage_check_statuses');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};