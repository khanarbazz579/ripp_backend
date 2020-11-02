'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await queryInterface.bulkDelete('email_providers', null, {});

        let currentDate = new Date();

        return await queryInterface.bulkInsert('email_providers', [{
            email_provider_name: 'Gmail',
            created_at: currentDate,
            updated_at: currentDate
        },
        {
            email_provider_name: 'Outlook',
            created_at: currentDate,
            updated_at: currentDate
        },
        {
            email_provider_name: 'Other Provider',
            created_at: currentDate,
            updated_at: currentDate
        },
        ]).then(_ => {
            queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        })
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('email_providers', null, {});
    }
};

