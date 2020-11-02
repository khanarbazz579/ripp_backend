'use strict';

module.exports = {
  up  : function (queryInterface, Sequelize) {
    return queryInterface
      .changeColumn(
        'custom_fields', 
        'model_name', {
          type: Sequelize.ENUM(
                  "first_name",
                  "last_name",
                  "email",
                  "phone_number",
                  "profile_image",
                  "name",
                  "birth_date",
                  "password",
                  "landline",
                  "sales_stage_id",
                  "source",
                  "owner"
          ),
          allowNull: true
      });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface
      .changeColumn(
        'custom_fields', 
        'model_name', {
          type: Sequelize.ENUM(
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
          ),
          allowNull: true
      });
  }
};