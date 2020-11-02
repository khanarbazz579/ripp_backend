'use strict';
module.exports = (sequelize, DataTypes) => {
  const analytic_app_users = sequelize.define('analytic_app_users', {
    analytic_app_id: DataTypes.INTEGER,
    browser_fingerprint: DataTypes.TEXT,
    user_type: DataTypes.TEXT,
    email: DataTypes.BOOLEAN,
    user_id: DataTypes.INTEGER,
    last_active: DataTypes.DATE,
    active_time: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN,
    device_active_time: DataTypes.JSON,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    referrer: DataTypes.JSON
  }, {
    underscored: true
  });

  analytic_app_users.associate = function (models) {

    this.belongsTo(models.analytic_apps, {
      foreignKey: 'analytic_app_id',
      targetKey: 'id',
      as: "app"
    });
    
    this.hasOne(models.analytics_app_activities, {
      foreignKey: 'analytic_app_user_id',
      targetKey: 'id',
      as: 'activities'
    });

    this.belongsTo(models.contacts, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: "contact"
    });

    // this.hasMany(models.analytic_app_forms, {
    //   as: 'submittedForms'
    // });

  };
  return analytic_app_users;
};