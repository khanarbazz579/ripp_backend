'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('user_two_factor_authentications',
          {
            "id": {
              "type": "INTEGER",
              "allowNull": false,
              "primaryKey": true,
              "autoIncrement": true
            },
            "user_id": {
              "allowNull": false,
              "type": "INTEGER"
            },
            "browser": {
              "type": "VARCHAR(256)",
              "allowNull": true
            },
            "location": {
              "type": "VARCHAR(256)",
              "allowNull": true
            },
            "ip_address": {
              "type": "VARCHAR(256)",
              "allowNull": true
            },
            "auth_code": {
              "type": "INTEGER(6)",
              "allowNull": false
            },
            "status": {
              "type": "BOOLEAN",
              "allowNull": false
            },
            "auth_error": {
              "type": "VARCHAR(256)",
              "allowNull": false
            },
            "remember_device": {
              "type": "BOOLEAN",
              "allowNull": true
            },
            "updated_at": {
              "type": "DATETIME",
              "allowNull": false
            },
            "created_at": {
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
        return queryInterface.dropTable('user_two_factor_authentications');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};