'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('permissions', {
      "id": {
        "type": "INTEGER",
        "allowNull": false,
        "primaryKey": true,
        "autoIncrement": true
      },
      "permission": {
        "type": Sequelize.STRING(500),
        "allowNull": false
      },
      "alternate_label": {
        "type": Sequelize.STRING(500),
        "allowNull": true
      },
      "is_custom": {
        "type": "TINYINT(1)",
        "allowNull": false,
      },
      "parent_id": {
        "type": "INTEGER",
        "allowNull": false
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
    return queryInterface.dropTable('permissions');
  }
};