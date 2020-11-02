'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
            .then(() => {
                return queryInterface.createTable('mailer_tokens', {
                    id: {
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        type: Sequelize.INTEGER
                    },
                    "email_user": {
                        "type": "VARCHAR(300)"
                    },
                    "mailer_token": {
                        "type": "TEXT"
                    },
                    "mailer_refresh_token": {
                        "type": "TEXT"
                    },
                    "status": {
                        "type": "VARCHAR(100)"
                    },
                    "created_at": {
                        "type": "DATETIME"
                    },
                    "updated_at": {
                        "defaultValue": null,
                        "type": "DATETIME"
                    },
                })
            })

        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
            .then(() => {
                return queryInterface.dropTable('mailer_tokens');
            })
            .then(() => {
                return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            });
    }
};