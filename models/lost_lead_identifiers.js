'use strict';

module.exports = (sequelize, DataTypes) => {
	var lostLeadIdentifiers = sequelize.define('lost_lead_identifiers', {
		name: {
			type: DataTypes.STRING(191),
			allowNull: false
		}
	}, {
		underscored: true,
		classMethods: {
			associate: function (models) {
				lostLeadIdentifiers.hasMany(models.leads_clients);
			}
		}
	});

	return lostLeadIdentifiers;
};