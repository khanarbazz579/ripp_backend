'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('share_files_folders',
          {
            "id": {
              "type": "INTEGER",
              "allowNull": false,
              "primaryKey": true,
              "autoIncrement": true
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
            "file_folder_access_id":{
              "allowNull": true,
              "type": "INTEGER",
              "references": {
                "model": "files_folders_accesses",
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
            "created_by": {
              "allowNull": true,
              "type": "INTEGER"
            },
            "permission": {
              "type": "ENUM('VIEW', 'EDIT')",
              "defaultValue": "VIEW",
              "values": [
                "VIEW",
                "EDIT"
              ],
              "comment": "VIEW : view only access to the file/folder, EDIT: Full access to the file/folder"
            },
            "status": {
              "type": "ENUM('SHARED', 'MOVED', 'REJECTED')",
              "allowNull": false,
              "defaultValue": "SHARED",
              "values": [
                "VIEW",
                "EDIT"
              ],
              "comment": "SHARED : belongs to only data of share tree, EDIT : belongs to SHARE to MOVE tree, REJECTED : belongs to SHARE to REJECT"
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

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.dropTable('file_properties');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};
