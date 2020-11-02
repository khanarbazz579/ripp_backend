'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('accounts',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "allowNull": false,
                    "type": "VARCHAR(191)"
                },
                "timezone_id": {
                    "allowNull": true,
                    "type": "INTEGER",
                    "references": {
                        "model": "timezones",
                        "key": "id"
                    },
                    "onDelete": "SET NUll",
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
            return queryInterface.addColumn(
                'users',
                'account_id',
                {
                  "allowNull": true,
                  "type": "INTEGER",
                  "references": {
                    "model": "accounts",
                    "key": "id"
                },
                "onDelete": "SET NULL",
                "onUpdate": "CASCADE"
                }
              );
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.dropTable('user_roles');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};