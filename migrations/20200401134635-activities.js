'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('analytics_app_activities', 'session_id'),
      queryInterface.removeColumn('analytics_app_activities', 'access_page'),
      queryInterface.addColumn('analytics_app_activities', 'access_device_raw', Sequelize.JSON)
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('analytics_app_activities', 'session_id', Sequelize.TEXT),
      queryInterface.addColumn('analytics_app_activities', 'access_page', Sequelize.TEXT),
      queryInterface.removeColumn('analytics_app_activities', 'access_device_raw')
    ]);
  }
};
