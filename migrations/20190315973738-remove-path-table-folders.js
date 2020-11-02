'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'folders',
        'path'
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'folders',
        'path',
        {
          type: DataTypes.TEXT,
          allowNull: flase
        }
      )
    ]);
  }
};
