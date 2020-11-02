'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.removeColumn('notes','entity_id');
        })
        .then(() => {
            return queryInterface.addColumn('notes','entity_id', {
              type: Sequelize.INTEGER,
              allowNull: true
          });
        })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.removeColumn('notes','entity_id')
  }
};