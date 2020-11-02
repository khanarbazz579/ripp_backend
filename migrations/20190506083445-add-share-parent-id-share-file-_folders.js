'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(() => {
      return queryInterface.addColumn(
        'share_files_folders',
        'share_parent_id',
        {
          "allowNull": true,
          "type": "INTEGER"
        }
      );
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('share_files_folders', 'share_parent_id');
  }
};
