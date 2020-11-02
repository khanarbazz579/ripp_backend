'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('share_guest_users', {
          "id": {
            "type": "INTEGER",
            "allowNull": false,
            "primaryKey": true,
            "autoIncrement": true
          },
          "first_name": {
            "type": "VARCHAR(191)",
            "allowNull": true
          },
          "last_name": {
            "type": "VARCHAR(191)",
            "allowNull": true
          },
          "email": {
            "type": "VARCHAR(191)",
            "allowNull": true,
            "unique": true,
            "validate": {
              "isEmail": {
                "msg": "Email number invalid."
              }
            }
          },
          "password": {
            "type": "VARCHAR(191)",
            "allowNull": true
          },
          "status": {
            "type": "TINYINT(1)",
            "defaultValue": 0
          },
          "url_token": {
            "type": "VARCHAR(191)",
            "allowNull": true
          },
          "email_verification_token": {
            "type": "VARCHAR(191)",
            "allowNull": true
          },
          "created_at": {
            "type": "DATETIME",
            "allowNull": false
          },
          "updated_at": {
            "type": "DATETIME",
            "allowNull": false
          }
        });
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('share_guest_users');
  }
};