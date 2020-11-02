'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('sales_stages',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": "VARCHAR(191)",
                    "allowNull": false
                },
                "description": {
                    "defaultValue": null,
                    "type": "VARCHAR(191)"
                },
                "default_id": {
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "close_probability": {
                    "defaultValue": 0,
                    "type": "INTEGER",
                    "allowNull": false
                },
                "priority_order": {
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "is_pipeline": {
                    "type": "TINYINT(1)",
                    "defaultValue": true
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
            return queryInterface.dropTable('sales_stages');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};