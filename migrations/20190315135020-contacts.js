'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('contacts',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "first_name": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "last_name": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "email": {
                    "allowNull": false,
                    "type": "VARCHAR(191)"
                },
                "phone_number": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "profile_image": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "entity_id": {
                    "allowNull": false,
                    "type": "INTEGER",
                    // "references": {
                    //     "model": "leads_clients",
                    //     "key": "id"
                    // },
                    // "onDelete": "NO ACTION",
                    // "onUpdate": "CASCADE"
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
                "priority_order": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "is_primary": {
                    "allowNull": false,
                    "type": "TINYINT(1)",
                    "defaultValue": false
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
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.dropTable('contacts');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};