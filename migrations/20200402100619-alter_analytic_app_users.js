'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('analytic_app_users', 'device_active_time', Sequelize.JSON),
      queryInterface.addColumn('analytic_app_users', 'referrer', Sequelize.JSON),
      queryInterface.removeColumn('analytics_app_activities', 'referred_from')
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('analytic_app_users', 'device_active_time'),
      queryInterface.removeColumn('analytic_app_users', 'referrer'),
      queryInterface.addColumn('analytics_app_activities', 'referred_from', Sequelize.TEXT)
    ]);
  }
};
