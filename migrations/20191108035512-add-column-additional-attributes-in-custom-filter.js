'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.addColumn('custom_filters','additional_attributes', {
                type: Sequelize.TEXT,
                allowNull: true
            });
            
        })
        .then(() => {
            queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
        })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.removeColumn('custom_filters','additional_attributes');
        })
        .then(() => {
            queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
        })
  }
};