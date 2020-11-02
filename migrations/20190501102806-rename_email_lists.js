'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn(
      'email_lists',
      'rank', 'priority_order',
      {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn(
      'email_lists',
      'priority_order', 'rank',
      {
        allowNull: false,
        type: Sequelize.INTEGER
      }
    );
  }
};
