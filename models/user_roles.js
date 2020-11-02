'use strict';

module.exports = (sequelize, DataTypes) => {
	var userRoles = sequelize.define('user_roles', {
		name: {
			allowNull: false,
			type: DataTypes.STRING(191),
		},
		parent_id: {
			allowNull: true,
            type: DataTypes.INTEGER,
		},
		created_by: {
			allowNull: true,
            type: DataTypes.INTEGER,
        }
	}, {
		underscored: true,
    });
    
    userRoles.associate = function (models) {
		this.parentFolder = this.belongsTo(models.user_roles, {
			foreignKey: 'parent_id', 
            targetKey: 'id',
            as: 'parent_user_role'			
		});
	};

	return userRoles;
};