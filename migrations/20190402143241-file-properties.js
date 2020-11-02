'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('file_properties',
          {
            "id": {
              "type": "INTEGER",
              "allowNull": false,
              "primaryKey": true,
              "autoIncrement": true
            },
            "file_id": {
              "allowNull": true,
              "type": "INTEGER",
              "references": {
                "model": "files_folders",
                "key": "id"
              },
              "onDelete": "cascade",
              "onUpdate": "CASCADE"
            },
            "size": {
              "type": "VARCHAR(191)"
            },
            "path": {
              "type": "VARCHAR(191)",
              "unique": true
            },
            "iconpath": {
              "type": "VARCHAR(191)",
              "unique": true
            },
            "mimetype": {
              "type": "VARCHAR(191)"
            },
            "extension_type": {
              "type": "VARCHAR(191)",
              "allowNull": true
            },
            "tag": {
              "allowNull": true,
              "type": "TEXT"
            },
            "description": {
              "allowNull": true,
              "type": "TEXT"
            },
            "width": {
              "allowNull": true,
              "type": "INTEGER"
            },
            "height": {
              "allowNull": true,
              "type": "INTEGER"
            },
            "quality": {
              "allowNull": true,
              "type": "INTEGER"
            },
            "aspect_ratio": {
              "allowNull": true,
              "type": "VARCHAR(191)"
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
        return queryInterface.dropTable('file_properties');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};