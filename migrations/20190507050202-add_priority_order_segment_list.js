"use strict";

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn("segment_lists", "priority_order", {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn("segment_lists", "priority_order", {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
