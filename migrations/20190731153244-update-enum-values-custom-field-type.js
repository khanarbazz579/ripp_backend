'use strict';

module.exports = {
  up  : function (queryInterface, Sequelize) {

    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.removeColumn('custom_fields','type');
        })
        .then(() => {
            return queryInterface.addColumn('custom_fields','type', {
              type: Sequelize.ENUM("LEAD","CLIENT","BOTH","SUPPLIER","USER"),
              defaultValue: "LEAD",
          });
        });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('custom_fields','type');
  }
};