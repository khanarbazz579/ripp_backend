'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('analytic_app_forms', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        form_id: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        analytic_app_user_id: {
          allowNull: true,
          type: Sequelize.INTEGER
        },
        form_values: {
          allowNull: true,
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
      }),
      queryInterface.createTable('forms', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          allowNull:false,
          type: Sequelize.INTEGER
        },
        form_id: {
          allowNull: false,
          type: "VARCHAR(60)"
        },
        form_name: {
          allowNull: true,
          type: "VARCHAR(60)"
        },
        analytic_app_id: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        form_fields: {
          allowNull: false,
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
      })
   ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('analytic_app_forms'),
      queryInterface.dropTable('forms')
    ]);
  }
};