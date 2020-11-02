'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.addColumn('users',
          'address',
          {
            type: Sequelize.STRING,
            defaultValue: null
          }
        );
      })
      .then(() => {
        return queryInterface.addColumn('users',
          'is_secure_access',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          }
        );
      })
      .then(() => {
        return queryInterface.changeColumn('users',
          'profile_image',
          {
            type: Sequelize.TEXT('long'),
            defaultValue: null
          }
        );
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.removeColumn('users', 'address');
      })
      .then(() => {
        return queryInterface.removeColumn('users', 'is_secure_access');
      })
  }
};
