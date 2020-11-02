'use strict';

module.exports = {
  up  : function (queryInterface, Sequelize) {
    return queryInterface
      .changeColumn(
        'custom_fields', 
        'table_name', {
          type: Sequelize.ENUM(
                  "leads_clients",
                  "users",
                  "companies",
                  "contacts",
                  "lead_client_details",
                  "user_details",
                  "company_details",
                  "contact_details",
                  "call_details",
                  "suppliers",
                  "supplier_details"
          ),
          allowNull: true
      });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface
      .changeColumn(
        'custom_fields', 
        'table_name', {
          type: Sequelize.ENUM(
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
          ),
          allowNull: true
      });
  }
};