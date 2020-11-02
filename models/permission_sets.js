'use strict';

module.exports = (sequelize, DataTypes) => {
	var permissionSet = sequelize.define('permission_sets', {
		name: {
			allowNull: false,
			type: DataTypes.STRING(191),
		},
		description: {
			allowNull: true,
			type: DataTypes.STRING(255)
		},
		created_by: {
			allowNull: false,
			type: DataTypes.INTEGER
		}
	}, {
		underscored: true,
		getterMethods: {
			created_at_formatted() {
				return new Date(this.created_at).toDateString()
			}
		}
	});

	permissionSet.associate = function (models) {

		this.belongsTo(models.users, {
			foreignKey: 'created_by',
			targetKey: 'id',
			as: 'owner'
		});

		this.hasMany(models.permission_sets_has_permissions, {
			foreignKey: 'permission_set_id',
			as: 'permission',
			targetKey: 'id',
			onDelete:"cascade"
		})

	};

	return permissionSet;
};