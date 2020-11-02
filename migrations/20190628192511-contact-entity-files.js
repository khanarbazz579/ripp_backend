'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('contact_entity_files',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "contact_id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "contacts",
                        "key": "id"
                    },
                    "onDelete": "cascade",
                    "onUpdate": "CASCADE"
                },
                "entity_file_id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "entity_files",
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
            })
        })

        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.dropTable('contact_entity_files');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};