'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.changeColumn('campaigns','preheader_text', {
              type: Sequelize.BLOB,
              allowNull: true
        });
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.removeColumn('campaigns','preheader_text')
  }
};