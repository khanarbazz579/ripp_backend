'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.changeColumn('custom_fields','additional_attribute', {
              type: Sequelize.TEXT,
              allowNull: true
        });
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.removeColumn('custom_fields','additional_attribute')
  }
};