'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface.removeColumn('call_outcomes_transitions','outcome_id');
        })
        .then(() => {
            return queryInterface.addColumn('call_outcomes_transitions','outcome_id', {
              type: Sequelize.INTEGER,
              allowNull: true
          });
        })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.removeColumn('call_outcomes_transitions','outcome_id')
  }
};