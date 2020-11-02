'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.dropTable('folders');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('folders',
          {
            "id": {
              "type": "INTEGER",
              "allowNull": false,
              "primaryKey": true,
              "autoIncrement": true
            },
            "name": {
              "type": "VARCHAR(191)"
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
            "created_at": {
              "type": "DATETIME"
            },
            "updated_at": {
              "defaultValue": null,
              "type": "DATETIME"
            },
            "type": {
              "type": "VARCHAR(191)"
            },
            "path": {
              "type": "TEXT"
            },
            "parent_id": {
              "allowNull": true,
              "type": "INTEGER",
              "references": {
                "model": "folders",
                "key": "id"
              },
              "onDelete": "cascade",
              "onUpdate": "CASCADE"
            },
            "shared_with": {
              "allowNull": true,
              "type": "TEXT"
            },
            "master_name": {
              "type": "VARCHAR(191)"
            },
            "count": {
              "type": "INTEGER"
            }
          })
      })

      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};