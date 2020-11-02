'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('daily_qoutes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quote: {
        type: Sequelize.TEXT,
        allowNull: true,
       },
      author : {
        type : Sequelize.STRING(191),
        allowNull: true
       },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('daily_qoutes');
  }
};