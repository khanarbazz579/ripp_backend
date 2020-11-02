'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('call_lists',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name" : {
                    "allowNull": false,
                    "type": "VARCHAR(191)",
                },
                "description" : {
                    "allowNull": false,
                    "type": "VARCHAR(191)",
                },
                "sechdule_date": {
                    "type": "DATETIME",
                    "allowNull": false
                },
                "user_id": {
                    "allowNull": false,
                    "type": "INTEGER"
                },
                "include_existing_call_contact": {
                    "allowNull" : false,
                    "type": "BOOLEAN",
                    "default": false
                },
                "custom_filter_id" : {
                    "allowNull": false,
                    "type": "INTEGER"
                },
                "updated_at": {
                    "type": "DATETIME",
                    "allowNull": false
                },
                "created_at": {
                    "type": "DATETIME",
                    "allowNull": false
                }
            })
        })
        .then(() => { 
            return queryInterface
            .changeColumn("custom_filters", 'type', {
                type: Sequelize.ENUM('LEAD','CLIENT','SUPPLIER','CALL','CALL_LIST'),
                allowNull : false,
                defaultValue :'LEAD',
              });  
        })
        .then(() => { 
            return queryInterface
            .addColumn("tasks", 'call_list_id', {
                type: "INTEGER",
                allowNull : true
            });  
        })

        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.dropTable('call_lists');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};