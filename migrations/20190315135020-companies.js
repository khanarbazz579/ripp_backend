'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('companies',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "allowNull": false,
                    "type": "VARCHAR(191)"
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
                    // "references": {
                    //     "model": "suppliers",
                    //     "key": "id"
                    // },
                    // "onDelete": "CASCADE",
                    // "onUpdate": "CASCADE"
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
            return queryInterface.dropTable('companies');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};