'use strict';
module.exports = (sequelize, DataTypes) => {
  const userHasPermissionSets = sequelize.define('user_has_permission_sets', {
    user_id: DataTypes.INTEGER,
    permission_set_id: DataTypes.INTEGER
  }, {
		underscored: true,
	});
  userHasPermissionSets.associate = function(models) {
    
    this.belongsTo(models.permission_sets, {
      foreignKey: 'permission_set_id',
      targetKey: 'id'
    })

    this.belongsTo(models.users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    })

  };
  return userHasPermissionSets;
};