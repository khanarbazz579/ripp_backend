'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('sections',
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
                "description": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "type": {
                    "type": "ENUM('LEAD_CLIENT', 'LEAD_CLIENT_CONTACT', 'LEAD_CLIENT_COMPANY', 'SUPPLIER', 'SUPPLIER_CONTACT', 'SUPPLIER_COMPANY', 'CALL', 'USER')",
                    "allowNull": false,
                    "defaultValue": "LEAD_CLIENT",
                    "values": [
                        "LEAD_CLIENT",
                        "LEAD_CLIENT_CONTACT",
                        "LEAD_CLIENT_COMPANY",
                        "SUPPLIER",
                        "SUPPLIER_CONTACT",
                        "SUPPLIER_COMPANY",
                        "CALL",
                        "USER"
                    ]
                },
                "priority_order": {
                    "defaultValue": 0,
                    "type": "INTEGER"
                },
                "client_priority_order": {
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "restrict_action": {
                    "type": "ENUM('0', '1', '2', '3', '4', '5', '6', '7')",
                    "allowNull": false,
                    "defaultValue": "0",
                    "values": [
                        "0",
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7"
                    ],
                    "comment": "0-Allow all, 1-restrict delete, 2-restrict edit, 3-restrict move, 4-restrict delete & edit, 5-restrict delete & move, 6-restrict move & edit, 7-restrict all"
                },
                "allow_add_fields": {
                    "type": "TINYINT(1)",
                    "defaultValue": false
                },
                "is_hidden": {
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
            return queryInterface.dropTable('sections');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};