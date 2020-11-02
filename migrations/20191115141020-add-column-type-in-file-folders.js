'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.addColumn(
          'files_folders', 
          'is_guest', 
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          }
        );
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.removeColumn('files_folders', 'is_guest');
      })
  }
};
