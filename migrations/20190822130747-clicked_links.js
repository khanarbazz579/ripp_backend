'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => {
        return queryInterface.createTable('clicked_links', {
          "id": {
            "type": "INTEGER",
            "allowNull": false,
            "primaryKey": true,
            "autoIncrement": true
          },
          "subscriber_id": {
            "type": "INTEGER",
            "allowNull": false
          },
          "template_link_id": {
            "type": "INTEGER",
            "allowNull": false,
            "references": {
              "model": "template_links",
              "key": "id"
            },
            "onDelete": "CASCADE",
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
        return queryInterface.dropTable('clicked_links');
      })
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      });
  }
};
