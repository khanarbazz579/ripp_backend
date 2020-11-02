'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.removeColumn('users','is_notification_check');
        })
        .then(() => {
            queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
        })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.addColumn('users','is_notification_check', {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            });
        })
        .then(() => {
            queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
        })
  }
};