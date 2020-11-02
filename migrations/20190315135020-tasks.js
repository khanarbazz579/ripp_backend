'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('tasks',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "task_type": {
                    "allowNull": true,
                    "type": "ENUM('CALL', 'MEETING', 'EVENT')",
                    "defaultValue": "CALL",
                    "values": [
                        "CALL",
                        "MEETING",
                        "EVENT"
                    ]
                },
                "start": {
                    "allowNull": true,
                    "type": "DATETIME"
                },
                "end": {
                    "allowNull": true,
                    "type": "DATETIME"
                },
                "when_marked_complete": {
                    "allowNull": true,
                    "type": "INTEGER"
                },
                "user_id": {
                    "allowNull": true,
                    "type": "INTEGER",
                    "references": {
                        "model": "users",
                        "key": "id"
                    },
                    "onDelete": "SET NULL",
                    "onUpdate": "CASCADE"
                },
                "supplier_id": {
                    "allowNull": true,
                    "type": "INTEGER",
                    "references": {
                        "model": "suppliers",
                        "key": "id"
                    },
                    "onDelete": "SET NULL",
                    "onUpdate": "CASCADE"
                },
                "lead_client_id": {
                    "allowNull": true,
                    "type": "INTEGER",
                    "references": {
                        "model": "leads_clients",
                        "key": "id"
                    },
                    "onDelete": "SET NULL",
                    "onUpdate": "CASCADE"
                },
                "marked_complete_by_id": {
                    "allowNull": true,
                    "type": "INTEGER"
                },
                "is_completed": {
                    "allowNull": true,
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "priority": {
                    "allowNull": true,
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "reason_for_call": {
                    "allowNull": true,
                    "type": "VARCHAR(255)"
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
            return queryInterface.dropTable('tasks');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};