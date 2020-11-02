'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('form_default_fields',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": "VARCHAR(191)",
                    "allowNull": false
                },
                "custom_field_id": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "references": {
                        "model": "custom_fields",
                        "key": "id"
                    },
                    "onDelete": "NO ACTION",
                    "onUpdate": "CASCADE"
                },
                "is_required": {
                    "type": "TINYINT(1)",
                    "defaultValue": false
                },
                "model_name": {
                    "type": "VARCHAR(191)",
                    "allowNull": true
                },
                "item_type": {
                    "type": "ENUM('0', '1', '2', '3')",
                    "allowNull": false,
                    "defaultValue": "0",
                    "values": [
                        "0",
                        "1",
                        "2",
                        "3"
                    ],
                    "comment": "0 - User, 1 - Lead , 2 -Client , 3-Supplier"
                },
                "priority_order": {
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "created_at": {
                    "type": "DATETIME",
                    "allowNull": false
                },
                "updated_at": {
                    "type": "DATETIME",
                    "allowNull": false
                },
                "field_id": {
                    "type": "INTEGER",
                    "allowNull": true,
                    "references": {
                        "model": "custom_fields",
                        "key": "id"
                    },
                    "onDelete": "SET NULL",
                    "onUpdate": "CASCADE"
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
            return queryInterface.dropTable('form_default_fields');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};