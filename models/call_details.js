'use strict';

module.exports = (sequelize, DataTypes) => {
	var callDetail = sequelize.define('call_details', {
		custom_field_id: {
			allowNull: false,
			type: DataTypes.INTEGER,
		},
		field_value: {
			allowNull: true,
			type: DataTypes.TEXT	
		},
		task_id: {
			allowNull: false,
			type: DataTypes.INTEGER	
		}
	}, {
		underscored: true,
	});

	callDetail.associate = function (models){
		this.belongsTo(models.custom_fields,{   
			foreignKey: "custom_field_id", 
			targetKey: 'id',
			as: 'custom_field'
		});
	};

	return callDetail;
};