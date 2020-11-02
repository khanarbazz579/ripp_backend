'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.addColumn('notifications','recipients_id', {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            });
        })
        .then(() => {
            queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
        })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.removeColumn('notifications','recipients_id');
        })
        .then(() => {
            queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
        })
  }
};