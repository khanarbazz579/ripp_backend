'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.removeColumn('todos','date');
        })
        .then(() => {
            return queryInterface.addColumn('todos','is_priority', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            });
        })
        .then(() => {
            return queryInterface.addColumn('todos','remind_me', {
                type: Sequelize.STRING,
                allowNull: true
            });
        })
  },

  down: (queryInterface, Sequelize) => {
    //return queryInterface.sequelize.removeColumn('tasks','contact_id')
  }
};
