'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('segment_lists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      segment_name: {
        type: Sequelize.STRING
      },
      segment_description: {
        type: Sequelize.STRING
      },
      criteria_id: {
        type: Sequelize.INTEGER
      },
      created_by: {
        type: Sequelize.STRING
      },
      list_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('segment_lists');
  }
};