'use strict';
module.exports = (sequelize, DataTypes) => {
  const analytic_app_forms = sequelize.define('analytic_app_forms', {
    form_id: DataTypes.INTEGER,
    form_name: DataTypes.TEXT,
    analytic_app_user_id: {
      type: DataTypes.INTEGER
    },
    form_values: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
  	underscored: true
  });
  analytic_app_forms.associate = function(models) {
    this.belongsTo(models.analytic_app_users)
  };
  return analytic_app_forms;
};