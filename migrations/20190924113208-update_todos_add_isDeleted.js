'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.addColumn('todos', 'is_deleted', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        });
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.removeColumn('todos', 'is_deleted');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};
