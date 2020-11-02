'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_has_permissions', {
      "id": {
        "type": "INTEGER",
        "allowNull": false,
        "primaryKey": true,
        "autoIncrement": true
      },
      "user_id": {
        "type": "INTEGER",
        "allowNull": false,
      },
      "permission_id": {
        "type": "INTEGER",
        "allowNull": false,
      },
      "access_type": {
        "type": Sequelize.ENUM('R', 'RW'),
        "allowNull":true,
        "values": [ 'RW', 'R' ]
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_has_permissions');
  }
};