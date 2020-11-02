'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('analytics_app_activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      analytic_app_user_id: {
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.TEXT
      },
      access_location: {
        type: Sequelize.JSON
      },
      access_device: {
        type: Sequelize.TEXT
      },
      access_page: {
        type: Sequelize.TEXT
      },
      referred_from: {
        type: Sequelize.TEXT
      },
      visits: {
        type: Sequelize.INTEGER
      },
      pages_viewed: {
        type: Sequelize.JSON
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('analytics_app_activities');
  }
};