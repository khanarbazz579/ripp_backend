'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('form_owner_mappings', {
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
      type: {
        allowNull: true,
        type: "VARCHAR(60)"
      },
      user_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      access: {
        allowNull: true,
        type: "VARCHAR(20)"
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('form_owner_mappings');
  }
};