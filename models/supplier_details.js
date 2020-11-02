'use strict';

module.exports = (sequelize, DataTypes) => {
	var supplierDetail = sequelize.define('supplier_details', {
		custom_field_id: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
		field_value: {
			allowNull: true,
			type: DataTypes.TEXT
		},
		supplier_id: {
			allowNull: false,
			type: DataTypes.INTEGER
		}
	}, {
		underscored: true
	});

	supplierDetail.associate = function (models) {
		this.belongsTo(models.custom_fields, {
			foreignKey: 'custom_field_id',
			targetKey: 'id',
			as: "custom_field"
		});
	};

	return supplierDetail;
};