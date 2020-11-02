'use strict';

module.exports = (sequelize, DataTypes) => {
	const accounts = sequelize.define('accounts', {
		"name": {
			allowNull: false,
			type: DataTypes.STRING(191),
        },
        "timezone_id" : {
            allowNull : true,
            type: DataTypes.INTEGER
        },
        "address":DataTypes.TEXT,
        "company_reg_number":DataTypes.STRING(255),
        "company_vat_number":DataTypes.STRING(255),
	}, {
		underscored: true
    });

    accounts.associate = function (models) {
		this.parentFolder = this.belongsTo(models.timezones, {
			foreignKey: 'timezone_id', 
            targetKey: 'id',
            as: 'timezone'			
        });
    }
	return accounts;
};