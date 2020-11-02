'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('currencies',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "symbol": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "symbol_native": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "name": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "decimal_digits": {
                    "allowNull": true,
                    "type": "INTEGER"
                },
                "rounding": {
                    "allowNull": true,
                    "type": "INTEGER"
                },
                "code": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "name_plural": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
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
            return queryInterface.dropTable('currencies');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};