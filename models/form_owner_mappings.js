'use strict';

module.exports = (sequelize, DataTypes) => {
  const form_owner_mappings = sequelize.define('form_owner_mappings', {
    form_id: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    type: DataTypes.TEXT,
    access: DataTypes.BOOLEAN,
  }, {
  	underscored: true
  });
  form_owner_mappings.associate = function(models) {

    this.belongsTo(models.users, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'user'
    });

    this.belongsTo(models.forms, {
      foreignKey: 'form_id',
      targetKey: 'id',
      as: 'form'
    });

  };
  return form_owner_mappings;
};