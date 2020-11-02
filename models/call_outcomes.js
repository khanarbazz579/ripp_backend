'use strict';

module.exports = (sequelize, DataTypes) => {
  	var callOutcome = sequelize.define('call_outcomes', {
      	name: {
          	allowNull: false,
          	type: DataTypes.STRING(191)
      	},
      	priority_order: {
          	defaultValue: 0,
			type: DataTypes.INTEGER
      	},
  	}, {
		underscored: true
	});

  	return callOutcome;
};