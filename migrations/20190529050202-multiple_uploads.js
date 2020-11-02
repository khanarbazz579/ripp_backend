'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('multiple_uploads',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "ref_name": {
                    "allowNull": false,
                    "type": "VARCHAR(191)"
                },
                "user_id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "references": {
                        "model": "users",
                        "key": "id"
                    },
                    "onDelete": "NO ACTION",
                    "onUpdate": "CASCADE"
                },
                "current_stage": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "field_array": {
                    "allowNull": false,
                    "type": "TEXT",
                    "defaultValue": ''
                },
                "error_count": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "total_count": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "duplicate_count": {
                    "allowNull": false,
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
            return queryInterface.dropTable('multiple_uploads');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};