'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('files_folders_accesses',
          {
            "id": {
              "type": "INTEGER",
              "allowNull": false,
              "primaryKey": true,
              "autoIncrement": true
            },
            "name": {
              "type": "VARCHAR(191)",
              "allowNull": true
            },
            "file_folder_id": {
              "allowNull": true,
              "type": "INTEGER",
              "references": {
                "model": "files_folders",
                "key": "id"
              },
              "onDelete": "cascade",
              "onUpdate": "CASCADE"
            },
            "user_id": {
              "type": "INTEGER",
              "allowNull": false,
              "references": {
                "model": "users",
                "key": "id"
              },
              "onDelete": "cascade",
              "onUpdate": "CASCADE"
            },
            "permission": {
              "type": "ENUM('VIEW', 'EDIT')",
              "allowNull": false,
              "defaultValue": "EDIT",
              "values": [
                "VIEW",
                "EDIT"
              ],
              "comment": "VIEW : belongs to only view permission, EDIT : belongs to perform all permission"
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
            "parent_id": {
              "allowNull": true,
              "type": "INTEGER",
            },
            "file_property_id": {
              "allowNull": true,
              "type": "INTEGER",
            },
            "refrence_id": {
              "type": "INTEGER",
              "allowNull": true
            },
            "master_name": {
              "type": "VARCHAR(191)",
              "allowNull": true
            },
            "count": {
              "type": "INTEGER",
              "allowNull": false,
              "defaultValue": 0,
            },
            "share_refrence_id": {
              "allowNull": true,
              "type": "INTEGER"
            },
            "created_at": {
              "type": "DATETIME",
              "allowNull": false
            },
            "updated_at": {
              "type": "DATETIME",
              "allowNull": false
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
        return queryInterface.dropTable('files_folders_access');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};