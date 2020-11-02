'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.changeColumn('campaigns','subject_line', {
              type: Sequelize.BLOB,
              allowNull: true
        });
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.removeColumn('campaigns','subject_line')
  }
};