'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('repeatable_events',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "title": {
                    "type": "VARCHAR(191)"
                },
                "type": {
                    "type": "ENUM('meeting', 'annualLeave', 'personal')",
                    "values": [
                        "meeting",
                        "annualLeave",
                        "personal"
                    ]
                },
                "color": {
                    "type": "ENUM('red', 'orange', 'green', 'yellow', 'purple', 'pink', 'blue', 'brown')",
                    "values": [
                        "red",
                        "orange",
                        "green",
                        "yellow",
                        "purple",
                        "pink",
                        "blue",
                        "brown"
                    ]
                },
                "location": {
                    "type": "VARCHAR(191)"
                },
                "start": {
                    "type": "DATETIME"
                },
                "end": {
                    "type": "DATETIME"
                },
                "details": {
                    "type": "VARCHAR(191)"
                },
                "is_multiday": {
                    "type": "TINYINT(1)",
                    "defaultValue": false
                },
                "user_id": {
                    "type": "INTEGER"
                },
                "contact_id": {
                    "type": "INTEGER"
                },
                "lead_client_id": {
                    "type": "INTEGER"
                },
                "email_reminder": {
                    "type": "TINYINT(1)",
                    "defaultValue": false
                },
                "meeting_room_id": {
                    "type": "INTEGER",
                    "allowNull": true
                },
                "text_reminder": {
                    "type": "TINYINT(1)",
                    "defaultValue": false
                },
                "repeat_every": {
                    "type": "INTEGER",
                    "defaultValue": 1
                },
                "repeat_type": {
                    "type": "ENUM('daily', 'weekday', 'weekly', 'monthly')",
                    "values": [
                        "daily",
                        "weekday",
                        "weekly",
                        "monthly"
                    ]
                },
                "target_repeat_day": {
                    "type": "VARCHAR(191)"
                },
                "continue": {
                    "type": "ENUM('forever', 'until', 'for')",
                    "values": [
                        "forever",
                        "until",
                        "for"
                    ],
                    "defaultValue": "forever"
                },
                "for_recurence": {
                    "type": "INTEGER"
                },
                "until_recurence": {
                    "type": "DATETIME"
                },
                "week_day_occurence": {
                    "type": "VARCHAR(191)"
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
            return queryInterface.dropTable('repeatable_events');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};