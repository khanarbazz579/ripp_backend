'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0'),
      queryInterface.sequelize.query('ALTER TABLE share_files_folders DROP FOREIGN KEY share_files_folders_ibfk_3'),
      queryInterface.sequelize.query('ALTER TABLE share_files_folders DROP INDEX user_id'),
      queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.sequelize.query("alter table share_files_folders ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
      })
  }
};
