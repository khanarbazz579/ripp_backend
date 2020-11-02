'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.addColumn('todos','user_id', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            });
        })
  },

  down: (queryInterface, Sequelize) => {
    //return queryInterface.sequelize.removeColumn('tasks','contact_id')
  }
};
