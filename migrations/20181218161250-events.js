'use strict';
module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
            .then(() => {
                return queryInterface.createTable('events',
                    {
                        "id": {
                            "type": "INTEGER",
                            "allowNull": false,
                            "primaryKey": true,
                            "autoIncrement": true
                        },
                        "title": {
                            "type": "VARCHAR(191)",
                            "allowNull": false
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
                            ],
                            "defaultValue": 'purple'
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
                        "is_all_day": {
                            "type": "TINYINT(1)",
                            "defaultValue": false
                        },
                        "is_meeting_room": {
                            "type": "TINYINT(1)",
                            "defaultValue": false
                        },
                        "user_id": {
                            "type": "INTEGER",
                            "allowNull": false
                        },
                        "meeting_room_id": {
                            "type": "INTEGER",
                            "allowNull": true
                        },
                        "text_reminder": {
                            "type": "VARCHAR(191)"
                        },
                        'is_send_email': {
                            "type": "BOOLEAN"
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
    down: function (queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
            .then(() => {
                return queryInterface.dropTable('events');
            })
            .then(() => {
                return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            });
    }
};