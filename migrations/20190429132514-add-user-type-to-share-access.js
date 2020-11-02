'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(() => {
      return queryInterface.addColumn(
        'share_files_folders',
        'user_type',
        {
          type: Sequelize.ENUM('CONTACT', 'USER', 'SHARE_GUEST'),
          defaultValue: "USER",
          values: [
            "CONTACT",
            "SHARE_GUEST",
            "USER"
          ]
        }
      );
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('share_files_folders', 'user_type');
  }
};
