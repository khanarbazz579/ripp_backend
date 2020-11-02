'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.addColumn(
          'permission_sets',
          'description',
          {
            "allowNull": true,
            "type": Sequelize.STRING(500)
          }
        );
      })
      .then(() => {
        return queryInterface.addColumn(
          'permission_sets',
          'created_by',
          {
            "allowNull": true,
            "type": "INTEGER"
          }
        );
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.removeColumn(
          'permission_sets',
          'description'
        );
      })
      .then(() => {
        return queryInterface.removeColumn(
          'permission_sets',
          'created_by'
        );
      })
  }
};
