'use strict';
 
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS=0"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` ADD `custom_field_id` int(11) NULL AFTER `is_custom`"),
        // queryInterface.sequelize.query("ALTER TABLE `permissions` ADD CONSTRAINT custom_field_ibfk FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION"),
        queryInterface.sequelize.query('ALTER TABLE `permissions` ADD `section_id` int(11) NULL AFTER `custom_field_id`'),
        // queryInterface.sequelize.query("ALTER TABLE `permissions` ADD CONSTRAINT section_ibfk FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` CHANGE `is_custom` `is_custom` tinyint(1) NOT NULL DEFAULT '0' AFTER `alternate_label`"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` ADD `is_section` tinyint(1) NOT NULL DEFAULT '0' AFTER `custom_field_id`"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` CHANGE `parent_id` `parent_id` int(11) NULL"),
        // queryInterface.sequelize.query("ALTER TABLE `permissions` ADD CONSTRAINT parent_permission_ibfk FOREIGN KEY (`parent_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION"),
        queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS=1")

      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS=0"),
        // queryInterface.sequelize.query("ALTER TABLE `permissions` DROP FOREIGN KEY `custom_field_ibfk`"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` DROP `custom_field_id`"),
        // queryInterface.sequelize.query("ALTER TABLE `permissions` DROP FOREIGN KEY `section_ibfk`"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` DROP `section_id`"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` CHANGE `is_custom` `is_custom` tinyint(1) NOT NULL AFTER `alternate_label`"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` DROP `is_section`"),
        queryInterface.sequelize.query("ALTER TABLE `permissions` CHANGE `parent_id` `parent_id` int(11) NOT NULL"),
        // queryInterface.sequelize.query("ALTER TABLE `permissions` DROP FOREIGN KEY `parent_permission_ibfk`"),
        queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS=1")
      ])
    })
  }
};