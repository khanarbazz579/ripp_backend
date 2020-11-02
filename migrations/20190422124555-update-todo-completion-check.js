'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return Promise.all([
        queryInterface.addColumn(
          'todos',
          'is_complete',
          {
            type: Sequelize.INTEGER,
            defaultValue:0
          }
        )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
        queryInterface.removeColumn(
            'todos',
            'is_complete',
        )
    ]);
  }
};
