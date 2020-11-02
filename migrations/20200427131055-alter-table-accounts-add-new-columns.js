'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('accounts', 'address', Sequelize.TEXT),
      queryInterface.addColumn('accounts', 'company_reg_number',Sequelize.STRING),
      queryInterface.addColumn('accounts', 'company_vat_number',Sequelize.STRING)
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('accounts', 'address', Sequelize.TEXT),
      queryInterface.removeColumn('accounts', 'company_reg_number',Sequelize.STRING),
      queryInterface.removeColumn('accounts', 'company_vat_number',Sequelize.STRING)
    ]);
  }
};
