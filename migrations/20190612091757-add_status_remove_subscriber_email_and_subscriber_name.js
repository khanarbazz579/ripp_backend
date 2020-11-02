'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.addColumn('subscribers', 'status', { type: Sequelize.STRING }),
      queryInterface.removeColumn('subscribers', 'subscriber_name'),
      queryInterface.removeColumn('subscribers', 'subscriber_email'),
    ]);

  },

  down: (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.addColumn('subscribers', 'subscriber_name', { type: Sequelize.STRING }),
      queryInterface.addColumn('subscribers', 'subscriber_email', { type: Sequelize.STRING }),
      queryInterface.removeColumn('subscribers', 'status'),
    ]);

  }
};