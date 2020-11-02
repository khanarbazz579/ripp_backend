'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('analytic_apps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      url: {
        type: "VARCHAR(900)"
      },
      app_id: {
        type: "VARCHAR(191)"
      },
      verified: {
        type: Sequelize.BOOLEAN,
        "defaultValue": 0
      },
      status: {
        type: Sequelize.BOOLEAN,
        "defaultValue": 1
      },
      created_at: {
        allowNull: false,
        type: "DATETIME"
      },
      updated_at: {
        allowNull: false,
        type: "DATETIME"
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('analytic_apps');
  }
};