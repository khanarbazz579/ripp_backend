'use strict';
module.exports = (sequelize, DataTypes) => {
  const forms = sequelize.define('forms', {
    form_id: DataTypes.TEXT,
    form_name: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
    type: DataTypes.TEXT,
    sales_stage_id: DataTypes.INTEGER,
    user_type: DataTypes.TEXT,
    field_mapping_buffer: {
      type: DataTypes.JSON,
      get() {
        let rawValue = this.getDataValue('field_mapping_buffer');
 
        if(rawValue) {
          rawValue = Object.keys(rawValue).map(key => ({
              key, 
              value: rawValue[key]
            })
          )
        };

        return rawValue;
      }
    },
    fields_mapped: DataTypes.BOOLEAN,
    verified: DataTypes.BOOLEAN
  }, {
  	underscored: true
  });
  forms.associate = function(models) {

    this.belongsTo(models.users, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'owner'
    });

    this.hasMany(models.form_owner_mappings, {
      as: 'owner_mappings'
    });

    this.hasMany(models.form_field_mappings, {
      as: 'field_mappings'
    });

    this.hasMany(models.form_submissions, {
      as: 'submissions'
    })

  };
  return forms;
};