'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('files',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": "VARCHAR(191)"
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
                "created_at": {
                    "type": "DATETIME"
                },
                "updated_at": {
                    "defaultValue": null,
                    "type": "DATETIME"
                },
                "size": {
                    "type": "VARCHAR(191)"
                },
                "path": {
                    "type": "VARCHAR(191)",
                    "unique": true
                },
                "type": {
                    "type": "VARCHAR(191)"
                },
                "extension_type": {
                    "type": "VARCHAR(191)",
                    "allowNull": true
                },
                "folder_id": {
                    "allowNull": true,
                    "type": "INTEGER",
                    "references": {
                        "model": "folders",
                        "key": "id"
                    },
                    "onDelete": "cascade",
                    "onUpdate": "CASCADE"
                },
                "refrence_id": {
                    "allowNull": true,
                    "type": "INTEGER"
                },
                "tag": {
                    "allowNull": true,
                    "type": "TEXT"
                },
                "description": {
                    "allowNull": true,
                    "type": "TEXT"
                },
                "shared_with": {
                    "allowNull": true,
                    "type": "TEXT"
                },
                "master_name": {
                    "type": "VARCHAR(191)"
                },
                "count": {
                    "type": "INTEGER"
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
                }
            })
        })

        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.dropTable('files');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};