'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.addColumn('mailer_tokens',
          'user_id',
          {
            type: Sequelize.INTEGER,
            defaultValue: null
          }
        );
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.removeColumn('mailer_tokens', 'user_id');
      })
  }
};
