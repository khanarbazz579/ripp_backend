'use strict';
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('permission', {
    permission: DataTypes.STRING,
    alternate_label: DataTypes.STRING,
    is_custom: DataTypes.BOOLEAN,
    custom_field_id: DataTypes.INTEGER,
    is_section: DataTypes.BOOLEAN,
    section_id: DataTypes.INTEGER,
    parent_id: {
      type: DataTypes.INTEGER,
      set(valueToBeSet) { // defines the 'setter'
        if (valueToBeSet > 0) {
          this.setDataValue('parent_id', valueToBeSet);
        } else {
          this.setDataValue('parent_id', null);
        }
      }
    }
  }, {
      underscored: true,
    });
  Permission.associate = function (models) {

    Permission.belongsTo(models.sections);

    Permission.belongsTo(models.custom_fields);

    Permission.hasMany(models.user_has_permissions, {
      foreignKey: 'permission_id',
      onDelete: "cascade"
    });

    Permission.hasMany(models.permission_sets_has_permissions, {
      foreignKey: 'permission_id',
      onDelete: "cascade"
    });
  };
  return Permission;
};