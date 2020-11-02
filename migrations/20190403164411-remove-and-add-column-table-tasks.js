'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.removeColumn('tasks','lead_client_id');
        })
        .then(() => {
            return queryInterface.removeColumn('tasks','supplier_id');
        })
        .then(() => {
            return queryInterface.addColumn('tasks','contact_id', {
              type: Sequelize.INTEGER,
              allowNull: false
          });
        })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.removeColumn('tasks','contact_id')
  }
};