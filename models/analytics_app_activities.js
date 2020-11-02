'use strict';
module.exports = (sequelize, DataTypes) => {
  const analytics_app_activities = sequelize.define('analytics_app_activities', {
    analytic_app_user_id: DataTypes.INTEGER,
    access_location: DataTypes.JSON,
    access_device: DataTypes.TEXT,
    visits: DataTypes.INTEGER,
    pages_viewed: DataTypes.JSON,
    access_device_raw: DataTypes.JSON,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    underscored: true,
  });

  analytics_app_activities.associate = function(models) {
    this.belongsTo(models.analytic_app_users, {
      foreignKey: 'analytic_app_user_id',
      targetKey: 'id',
      as: "app_user"
    });
  };
  return analytics_app_activities;
};