'use strict';
module.exports = (sequelize, DataTypes) => {
  const form_submission_values = sequelize.define('form_submission_values', {
    form_submission_id: DataTypes.INTEGER,
    custom_field_id: DataTypes.INTEGER,
    form_field_mapping_id: DataTypes.INTEGER,
    value: DataTypes.TEXT
  }, {
    underscored: true
  });
  form_submission_values.associate = function(models) {

    this.belongsTo(models.form_submissions);

    this.belongsTo(models.form_field_mappings);
    // associations can be defined here
  };
  return form_submission_values;
};