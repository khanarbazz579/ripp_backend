'use strict';

module.exports = {
  up  : function (queryInterface, Sequelize) {
    return queryInterface
      .changeColumn(
        'notes', 
        'entity_type', {
          type: Sequelize.ENUM(
                  "LEAD_CLIENT",
                  "SUPPLIER",
                  "CONTACT"
          ),
          allowNull: false
      });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface
      .changeColumn(
        'notes', 
        'entity_type', {
          type: Sequelize.ENUM(
                  "LEAD_CLIENT",
                  "SUPPLIER",
          ),
          allowNull: false
      });
  }
};