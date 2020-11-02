'use strict';
module.exports = (sequelize, DataTypes) => {
  const permission_sets_has_permissions = sequelize.define('permission_sets_has_permissions', {
    permission_id: DataTypes.INTEGER,
    permission_set_id: DataTypes.INTEGER,
    access_type: {
      type: DataTypes.ENUM('R', 'RW')
    }
  }, {
		underscored: true,
	});
  permission_sets_has_permissions.associate = function(models) {

    this.belongsTo(models.permission, {
      foreignKey: 'permission_id',
      targetKey: 'id'
    })

    this.belongsTo(models.permission_sets, {
      foreignKey: 'permission_set_id',
      targetKey: 'id'
    })
  };
  return permission_sets_has_permissions;
};