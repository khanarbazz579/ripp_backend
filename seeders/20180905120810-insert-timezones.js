'use strict';

let allTimezones = require('../public/raw-jsons/alltimezones.json');

module.exports = {
    up: async (queryInterface, Sequelize) => {
      //  console.log(timezones)
      const timezones = Object.keys(allTimezones).map((key) => {
            return {
                key : key,
                value : allTimezones[key]
            };
        })
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
       // await queryInterface.sequelize.query('TRUNCATE TABLE timezones');
        await queryInterface.bulkInsert('timezones', timezones, {});
        return await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('timezones', null, {});
    }
};