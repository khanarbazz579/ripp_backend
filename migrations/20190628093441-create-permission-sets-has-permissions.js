'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('permission_sets_has_permissions', {
      "id": {
        "type": "INTEGER",
        "allowNull": false,
        "primaryKey": true,
        "autoIncrement": true
      },
      "permission_id": {
        "type": "INTEGER",
        "allowNull": false,
      },
      "permission_set_id": {
        "type": "INTEGER",
        "allowNull": false,
      },
      "access_type": {
        "type": Sequelize.ENUM('R', 'RW'),
        "allowNull": true,
        "values": ['R', 'RW']
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
    return queryInterface.dropTable('permission_sets_has_permissions');
  }
};