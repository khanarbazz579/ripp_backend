'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('leads_shared_records', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      access_type: {
        type: Sequelize.ENUM('R', 'RW', 'RWX'),
        allowNull: false,
        defaultValue: 'R',
        values: ['R', 'RW', 'RWX']
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    return queryInterface.dropTable('leads_shared_records');
  }
};