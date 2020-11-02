'use strict';
module.exports = (sequelize, DataTypes) => {
  const userHasPermission = sequelize.define('user_has_permissions', {
    user_id: DataTypes.INTEGER,
    permission_id: DataTypes.INTEGER,
    access_type: {
      type: DataTypes.ENUM('R', 'RW')
    }
  }, {
		underscored: true,
	});
  userHasPermission.associate = function(models) {

    userHasPermission.belongsTo(models.users);

    userHasPermission.belongsTo(models.permission);
    
  };
  return userHasPermission;
};