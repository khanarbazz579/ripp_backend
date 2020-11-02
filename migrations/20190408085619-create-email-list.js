'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('email_lists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      list_name: {
        type: Sequelize.STRING
      },
      list_description: {
        type: Sequelize.STRING
      },
      from_name: {
        type: Sequelize.STRING
      },
      from_email: {
        type: Sequelize.STRING
      },
      reply_email: {
        type: Sequelize.STRING
      },
      created_by: {
        allowNull: false, 
        type: Sequelize.INTEGER
      },
      rank: {
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
    return queryInterface.dropTable('email_lists');
  }
};