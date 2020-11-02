'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.addColumn('users',
          'idle_session_time_out',
          {
            type: Sequelize.TIME,
            defaultValue: null
          }
        );
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.removeColumn('users', 'idle_session_time_out');
      })
  }
};
