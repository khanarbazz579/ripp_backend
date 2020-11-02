'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('event_repeats',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "repeat_type": {
                     "type": "ENUM('none', 'every_day', 'every_week','every_month','every_year','custom')",
                    "values": [
                        'none', 'every_day', 'every_week','every_month','every_year','custom'
                    ]
                },
                "custom_type": {
                    "type": "ENUM('daily', 'weekly', 'monthly','yearly')",
                    "values": [
                        'daily', 'weekly', 'monthly','yearly'
                    ]
                },
                "every": {
                    "type": "INTEGER"
                },
                "type": {
                    "type": "ENUM('each', 'on')",
                    "values": [
                       'each', 'on'
                    ]
                },

                "event_repeat_day": {
                    "type": "VARCHAR(500)"
                },
                "day_type": {
                    "type":"VARCHAR(191)"
                },
                "on_day": {
                   "type":"VARCHAR(191)"
                },
                "end_repeat": {
                     "type":"VARCHAR(191)"
                },
                "end_repeat_on_date": {
                    "type": "DATE"
                },
                "end_repeat_on_hours": {
                    "type": "INTEGER"
                },
                "event_id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "events",
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
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.dropTable('event_repeats');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        });
    }
};
