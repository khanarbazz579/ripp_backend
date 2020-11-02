'use strict';

const data = require('./../services/currencyList') ;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('currencies',data.currency, {});  
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('currencies', null, {});
  }
};
