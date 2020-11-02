'use strict';

const countries = require('./../services/countryList') ;

module.exports = {
  up:async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
		await queryInterface.sequelize.query('TRUNCATE TABLE countries');
    await queryInterface.bulkInsert('countries',countries.country, {});  
    return await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('countries', null, {});
  }
};
