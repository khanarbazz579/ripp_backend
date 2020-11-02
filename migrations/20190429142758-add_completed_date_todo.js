'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return Promise.all([
        queryInterface.addColumn(
          'todos',
          'completed_date',
          {
            type: "DATETIME",
            allowNull: true
          }
        )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
        queryInterface.removeColumn(
            'todos',
            'completed_date',
        )
    ]);
  }
};
