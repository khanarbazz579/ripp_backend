'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return Promise.all([
      queryInterface.sequelize
        .query("SET FOREIGN_KEY_CHECKS = 0"),
      queryInterface.sequelize.query(
        "ALTER TABLE `subscribers` ADD CONSTRAINT `contact_sub_rel` FOREIGN KEY (`subscriber_id`) REFERENCES `contacts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION"
      ),
      queryInterface.sequelize.query("ALTER TABLE `contact_filters` ADD UNIQUE KEY `filter_unique_key` (`type`, `user_id`,`list_id`)"),
      queryInterface.sequelize
        .query("SET FOREIGN_KEY_CHECKS = 1")
    ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */

    // return queryInterface.dropTable('subscribers');
    // .then(() => {
    // return queryInterface.dropTable('contacts');
    // })

    return queryInterface.sequelize
      .query("SET FOREIGN_KEY_CHECKS = 0")
      .then(() => {
        return queryInterface.sequelize.query("ALTER TABLE `subscribers` DROP INDEX `contact_sub_rel`");
      })
      .then(() => {
        return queryInterface.dropTable("ALTER TABLE `contact_filters` DROP INDEX `filter_unique_key`");
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
      });

  }
};
