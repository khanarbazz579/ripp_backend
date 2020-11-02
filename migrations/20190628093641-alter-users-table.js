'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0"),
      queryInterface.sequelize.query(
        "ALTER TABLE `users` DROP FOREIGN KEY `users_ibfk_2`"
      ),
      queryInterface.sequelize.query(
        "ALTER TABLE `users` DROP INDEX `permission_set_id`"
      ),
      queryInterface.changeColumn('users', 'permission_set_id', {
        type: "INTEGER",
        allowNull: true
      }),
      queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1")
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query("SET FOREIGN_KEY_CHECKS = 0")
      .then(() => {
        return queryInterface.sequelize.query("alter table users ADD FOREIGN KEY (permission_set_id) REFERENCES permission_sets(id) ON DELETE CASCADE");
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
      });
  }
};