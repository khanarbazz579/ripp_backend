'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.addColumn('invite_events', 'reminder_date', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query("SET FOREIGN_KEY_CHECKS = 0")
      .then(() => {
        return queryInterface.removeColumn('invite_events', 'reminder_date')
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};
