'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('notifications',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "type": {
                    "type": "ENUM('CALL', 'EVENT', 'EVENT_ACCEPT', 'EVENT_REJECT', 'TODO', 'EMAIL')",
                    "allowNull": false,
                    "defaultValue": "CALL",
                    "values": [
                        "CALL",
                        "EVENT",
                        "EVENT_ACCEPT",
                        "EVENT_REJECT",
                        "TODO",
                        "EMAIL"
                    ]
                },
                "target_time": {
                    "type": "DATETIME"
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
                "target_event_id": {
                    "allowNull": false,
                    "type": "INTEGER"
                },
                "is_read": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "is_miss": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "defaultValue": 0
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
            return queryInterface.dropTable('notifications');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};