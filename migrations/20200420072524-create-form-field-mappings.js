'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('form_field_mappings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      form_id: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      input_name: {
        type: "VARCHAR(90)",
        comment: 'In case of existing form'
      },
      column: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      custom_field_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      field_attributes: {
        type: Sequelize.JSON
      },
      styles: {
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
    return queryInterface.dropTable('form_field_mappings');
  }
};