'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.addColumn('subscribers', 'hardbounce_count', { type: Sequelize.INTEGER }),
      queryInterface.addColumn('subscribers', 'last_hardbounce_at', { type: Sequelize.DATE })
    ]);

  },

  down: (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.removeColumn('subscribers', 'hardbounce_count'),
      queryInterface.removeColumn('subscribers', 'last_hardbounce_at')
    ]);

  }
};
