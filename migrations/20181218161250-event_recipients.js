'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('event_recipients',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "event_id": {
                    "type": "INTEGER"
                },

                "contact_id": {
                    "type": "INTEGER"
                },
                "fixed":{
                   "type": "TINYINT(1)",
                    "defaultValue": false
                },
                "email": {
                    "type": "VARCHAR(191)"
                },
                "status": {
                    "type": "ENUM('accepted', 'rejected', 'pending')",
                    "values": [
                        "accepted",
                        "rejected",
                        "pending"
                    ],
                    "defaultValue": "pending"
                },
                "mail_notification_sent": {
                    "type": "TINYINT(1)",
                    "defaultValue": false
                },
                "text_notification_sent": {
                    "type": "TINYINT(1)",
                    "defaultValue": false
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
            return queryInterface.dropTable('event_recipients');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};