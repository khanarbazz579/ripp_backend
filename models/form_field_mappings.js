'use strict';
module.exports = (sequelize, DataTypes) => {
  const form_field_mappings = sequelize.define('form_field_mappings', {
    form_id: DataTypes.INTEGER,
    order: DataTypes.INTEGER,
    column: DataTypes.INTEGER,
    input_name: DataTypes.TEXT,
    custom_field_id: DataTypes.INTEGER,
    field_attributes: DataTypes.JSON,
    styles: {
      type: DataTypes.JSON,
      set(value) {
        let d = {};
        try {
          d = JSON.parse(value);
        } catch (err) {
          
        }

        this.setDataValue('styles', d)
      },
      get(value) {
        try {
          return JSON.parse(this.getDataValue('styles'))
        } catch(err) {
          return {}
        }
      }
    }
  }, {
    underscored: true
  });
  form_field_mappings.associate = function(models) {

    this.belongsTo(models.forms, {
      as: 'form'
    });

    this.belongsTo(models.custom_fields, {
      as: 'custom_field',
    });

    this.hasMany(models.form_submission_values, {
      as: 'values'
    });
  };

  return form_field_mappings;
};