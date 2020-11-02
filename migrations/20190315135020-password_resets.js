'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('password_resets',
            {
                "email": {
                    "type": "VARCHAR(191)",
                    "primaryKey": true
                },
                "token": {
                    "type": "VARCHAR(191)"
                },
                "generated": {
                    "type": "VARCHAR(191)"
                },
                "expired_at": {
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
            return queryInterface.dropTable('password_resets');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};