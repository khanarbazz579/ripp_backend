'use strict';
module.exports = (sequelize, DataTypes) => {
  const analytic_apps = sequelize.define('analytic_apps', {
    user_id: DataTypes.INTEGER,
    url: DataTypes.TEXT,
    app_id: DataTypes.TEXT,
    verified: DataTypes.BOOLEAN,
    status: DataTypes.BOOLEAN
  }, {
    underscored: true,
  });

  analytic_apps.associate = function (models) {

    this.belongsTo(models.users, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });

    // this.hasMany(models.analytic_app_users, {
    //   foreignKey: 'analytic_app_id',
    //   targetKey: 'id'
    // });
  
  };
  return analytic_apps;
};