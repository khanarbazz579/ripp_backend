'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('analytic_app_users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      analytic_app_id: {
        type: Sequelize.INTEGER
      },
      browser_fingerprint: {
        type: "varchar(191)"
      },
      user_type: {
        type: "varchar(60)"
      },
      email: {
        type:  "varchar(191)"
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      last_active: {
        type: Sequelize.DATE,
        allowNull: true
      },
      active_time: {
        type: Sequelize.INTEGER
      },
      is_active: {
        type: Sequelize.BOOLEAN
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('analytic_app_users');
  }
};