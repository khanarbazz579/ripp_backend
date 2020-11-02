'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_has_permission_sets', {
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
    "permission_set_id": {
        "type": "INTEGER",
        "allowNull": false,
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
    return queryInterface.dropTable('user_has_permission_sets');
  }
};