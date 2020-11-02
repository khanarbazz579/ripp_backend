'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('histories',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "user_id": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "references": {
                        "model": "users",
                        "key": "id"
                    },
                    "onDelete": "NO ACTION",
                    "onUpdate": "CASCADE"
                },
                "contact_id": {
                    "allowNull": true,
                    "type":  "INTEGER"
                },
                "entity_id": {
                    "allowNull": true,
                    "type":  "INTEGER"
                },
                "entity_type": {
                    "type": 'ENUM("LEAD_CLIENT", "SUPPLIER", "OUTCOME_TRANSITION","NOTE","CALL","INBOUND_CALL", "EVENT", "TODO")',
                    "allowNull": false,
                    "defaultValue": "NOTE",
                    "values": [
                        "LEAD_CLIENT",
                        "SUPPLIER",
                        "OUTCOME_TRANSITION",
                        "NOTE",
                        "CALL",
                        "INBOUND_CALL",
                        "EVENT",
                        "TODO",
                    ]
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
            return queryInterface.dropTable('histories');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};