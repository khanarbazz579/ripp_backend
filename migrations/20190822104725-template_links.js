'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('template_links', {
          "id": {
            "type": "INTEGER",
            "allowNull": false,
            "primaryKey": true,
            "autoIncrement": true
          },
          "text": {
            "type": Sequelize.STRING(500),
            "allowNull": false
          },
          "href": {
            "type": Sequelize.STRING(500),
            "allowNull": false
          },
          "list_id": {
            "type": "INTEGER",
            "allowNull": false
          },
          "campaign_id": {
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
        })
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.dropTable('template_links');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};
