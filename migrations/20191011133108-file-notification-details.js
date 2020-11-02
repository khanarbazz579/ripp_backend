'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('file_notification_details',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "entity_type": {
                    "type": "ENUM('LEAD_CLIENT', 'SUPPLIER')",
                    "allowNull": false,
                    "defaultValue": "LEAD_CLIENT",
                    "values": [
                        "LEAD_CLIENT",
                        "SUPPLIER"
                    ],
                    "comment": "LEAD_CLIENT : belongs to lead_client, SUPPLIER : belongs to supplier"
                },
                "entity_id": {
                    "allowNull": false,
                    "type": "INTEGER",
                },
                "file_name": {
                    "allowNull": true,
                    "type": "VARCHAR(191)",
                },
                "file_id": {
                    "allowNull": true,
                    "type": "INTEGER",
                },
                "progress": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "defaultValue": 0,
                },
                "is_read": {
                    "type": "TINYINT(1)",
                    "defaultValue": false
                },
                "user_id": {
                    "allowNull": false,
                    "type": "INTEGER",
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
            return queryInterface.dropTable('file_notification_details');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};