'use strict';
module.exports = (sequelize, DataTypes) => {
  const form_submissions = sequelize.define('form_submissions', {
    form_id: DataTypes.INTEGER,
    analytic_app_id: DataTypes.INTEGER,
    analytic_app_user_id: DataTypes.INTEGER
  }, {
    underscored: true
  });
  form_submissions.associate = function(models) {
  	this.belongsTo(models.analytic_apps);

  	this.belongsTo(models.analytic_app_users);

  	this.hasMany(models.form_submission_values, {
  		as: 'values'
  	});
  };
  return form_submissions;
};