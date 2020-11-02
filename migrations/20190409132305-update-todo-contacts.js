'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.changeColumn('todo_contacts','created_at', {
                type: "DATETIME",
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            });
        })
        .then(() => {
            return queryInterface.changeColumn('todo_contacts','updated_at', {
                type: "DATETIME",
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            });
        })
  },

  down: (queryInterface, Sequelize) => {

  }
};
