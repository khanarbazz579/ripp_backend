'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.createTable('custom_fields',
            {
                "id": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "type": {
                    "allowNull": false,
                    "type": "ENUM('LEAD', 'CLIENT', 'BOTH', 'NONE')",
                    "defaultValue": "LEAD",
                    "values": [
                        "LEAD",
                        "CLIENT",
                        "BOTH",
                        "NONE"
                    ]
                },
                "table_name": {
                    "type": "ENUM('leads_clients', 'users', 'companies', 'contacts', 'lead_client_details', 'user_details', 'company_details', 'contact_details', 'call_details', 'supplier_details')",
                    "allowNull": true,
                    "values": [
                        "leads_clients",
                        "users",
                        "companies",
                        "contacts",
                        "lead_client_details",
                        "user_details",
                        "company_details",
                        "contact_details",
                        "call_details",
                        "supplier_details"
                    ]
                },
                "model_name": {
                    "type": "ENUM('first_name', 'last_name', 'email', 'phone_number', 'profile_image', 'name', 'birth_date', 'password', 'landline', 'sales_stage_id')",
                    "allowNull": true,
                    "values": [
                        "first_name",
                        "last_name",
                        "email",
                        "phone_number",
                        "profile_image",
                        "name",
                        "birth_date",
                        "password",
                        "landline",
                        "sales_stage_id"
                    ]
                },
                "label": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "placeholder": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "help_text": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "control_type": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "additional_attribute": {
                    "allowNull": true,
                    "type": "VARCHAR(191)"
                },
                "section_id": {
                    "allowNull": false,
                    "type": "INTEGER",
                    "references": {
                        "model": "sections",
                        "key": "id"
                    },
                    "onDelete": "NO ACTION",
                    "onUpdate": "CASCADE"
                },
                "priority_order": {
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "client_priority_order": {
                    "type": "INTEGER",
                    "defaultValue": 0
                },
                "restrict_action": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "defualtValue": 0
                },
                "field_size": {
                    "type": "INTEGER",
                    "allowNull": false,
                    "defualtValue": 12
                },
                "is_required": {
                    "allowNull": true,
                    "type": "TINYINT(1)",
                    "defualtValue": false
                },
                "is_hidden": {
                    "allowNull": true,
                    "type": "TINYINT(1)",
                    "defualtValue": false
                },
                "is_default": {
                    "allowNull": true,
                    "type": "TINYINT(1)",
                    "defualtValue": false
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
            return queryInterface.dropTable('custom_fields');
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};