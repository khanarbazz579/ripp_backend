'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.changeColumn('email_users','type', {
              type: Sequelize.STRING,
              allowNull: true
        });
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.removeColumn('email_users','type')
  }
};