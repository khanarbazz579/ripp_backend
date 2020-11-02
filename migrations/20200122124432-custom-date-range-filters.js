'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('custom_date_range_filters',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "type": {
                    "type": "ENUM('TODO', 'LEAD')",
                    "allowNull": false,
                    "defaultValue": "TODO",
                    "values": [
                        "TODO",
                        "LEAD"
                    ]
                },
                "start_date": {
                    "type": "DATETIME"
                },
                "end_date": {
                    "type": "DATETIME"
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
            return queryInterface.dropTable('custom_date_range_filters');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};