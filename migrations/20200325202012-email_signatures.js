'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('email_signatures',
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
            "file_path": {
              "type": "TEXT",
              "allowNull": true
            },
            "file_name": {
              "type": "TEXT",
              "allowNull": true
            },
            "signature_text": {
              "type": "TEXT",
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
        return queryInterface.dropTable('email_signatures');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};