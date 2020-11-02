'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('entity_files',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": "VARCHAR(191)",
                    "allowNull": true,
                },
                "created_by": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "users",
                        "key": "id"
                    },
                    "onDelete": "cascade",
                    "onUpdate": "CASCADE"
                },
                "entity_type": {
                    "type": "ENUM('LEAD_CLIENT', 'SUPPLIER')",
                    "allowNull": false,
                    "defaultValue": "LEAD_CLIENT",
                    "values": [
                        "LEAD_CLIENT",
                        "SUPPLIER"
                    ],
                    "comment": "LEAD_CLIENT : belongs to lead_client, SUPPLIER : belongs to supplier"
                },
                "entity_id": {
                    "allowNull": false,
                    "type": "INTEGER",
                },
                "file_category_id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "file_categories",
                        "key": "id"
                    },
                    "onDelete": "cascade",
                    "onUpdate": "CASCADE"
                },
                "size": {
                    "type": "VARCHAR(191)",
                    "allowNull": true
                },
                "path": {
                    "type": "VARCHAR(191)",
                    "unique": true
                },
                "icon_path": {
                    "type": "VARCHAR(191)",
                    "unique": true
                },
                "mimetype": {
                    "type": "VARCHAR(191)",
                    "allowNull": true
                },
                "extension_type": {
                    "type": "VARCHAR(191)",
                    "allowNull": true
                },
                "width": {
                    "allowNull": true,
                    "type": "INTEGER"
                },
                "height": {
                    "allowNull": true,
                    "type": "INTEGER"
                },
                "quality": {
                    "allowNull": true,
                    "type": "INTEGER"
                },
                "aspect_ratio": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
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
            return queryInterface.dropTable('entity_files');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};