'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {

        let currentDate = new Date();
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        await queryInterface.sequelize.query('TRUNCATE TABLE daily_qoutes');

        await queryInterface.bulkInsert('daily_qoutes', [
            {
                quote: "Your customer doesn’t care how much you know until they know how much you care.",
                author: "Damon Richards",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Customers don’t expect you to be perfect. They do expect you to fix things when they go wrong.",
                author: "Donald Porter",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Know what your customers want most and what your company does best. Focus on where those two meet.",
                author: "Kevin Stirtz",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Make your product easier to buy than your competition, or you will find your customers buying from them, not you..",
                author: "Mark Cuban",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Every contact we have with a customer influences whether or not they’ll come back. We have to be great every time or we’ll lose them.",
                author: "DKevin Stirtz",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Here is a simple but powerful rule: always give people more than what they expect to get.",
                author: "Nelson Boswell",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Good customer service costs less than bad customer service.",
                author: "Sally Gronow",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Make a customer, not a sale.",
                author: "Katherine Barchetti",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Be genuine. Be remarkable. Be worth connecting with.",
                author: "Seth Godin",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Stop selling. Start helping.",
                author: "Zig Ziglar",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "There are no traffic jams along the extra mile.",
                author: "Roger Staubach",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Customer service is not a department, it’s everyone’s job.",
                author: "Anonymous",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "If you make a sale, you can make a living. If you make an investment of time and good service, you can make a fortune.",
                author: "Jim Rohn",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Make every interaction count, even the small ones. They are all relevant.",
                author: "Shep Hyken",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Every client you keep is one less you need to find.",
                author: "Nigel Sanders",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Successful people do what unsuccessful people are not willing to do.",
                author: "Jeff Olson",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Your customer doesn’t care how much you know until they know how much you care. ",
                author: "Damon Richards",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Nothing is so contagious as enthusiasm. ",
                author: "Samuel Taylor Coleridge",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Forget ‘branding’ and ‘positioning.’ Once you understand customer behavior, everything else falls into place.",
                author: "homas G. Stemberg",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "Be everywhere, do everything, and never fail to astonish the customer.",
                author: "Macy’s Motto",
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                quote: "The more you engage with customers, the clearer things become and the easier it is to determine what you should be doing.",
                author: "John Russell",
                created_at: currentDate,
                updated_at: currentDate,
            },

        ], {}).then(() => {
				return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
			});
    },

    down: (queryInterface, Sequelize) => {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.bulkDelete('Person', null, {});
        */
       return queryInterface.bulkDelete('daily_qoutes', null, {});
    }
};
