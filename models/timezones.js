'use strict';

module.exports = (sequelize, DataTypes) => {
	const timeZones = sequelize.define('timezones', {
        "key": {
			allowNull: false,
			type: DataTypes.STRING(191),
        },
		"value": {
			allowNull: false,
			type: DataTypes.STRING(191),
        }
	}, {
        timestamps: false,
		underscored: true
    });

	return timeZones;
};