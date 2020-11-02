'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('files_folders',
          {
            "id": {
              "type": "INTEGER",
              "allowNull": false,
              "primaryKey": true,
              "autoIncrement": true
            },
            "original_name": {
              "type": "VARCHAR(191)",
              "allowNull": false,
            },
            "created_by": {
              "type": "INTEGER",
              "allowNull": false,
              "references": {
                "model": "users",
                "key": "id"
              },
              "onDelete": "cascade",
              "onUpdate": "CASCADE"
            },
            "entity_type": {
              "type": "ENUM('FOLDER', 'FILE')",
              "allowNull": false,
              "defaultValue": "FILE",
              "values": [
                "FOLDER",
                "FILE"
              ],
              "comment": "FOLDER : belongs to directory, FILE : belongs to files"
            },
            "created_at": {
              "type": "DATETIME"
            },
            "updated_at": {
              "defaultValue": null,
              "type": "DATETIME"
            }
          })
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.dropTable('files_folders');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};