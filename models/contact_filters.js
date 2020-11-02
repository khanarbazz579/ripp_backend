'use strict';
module.exports = (sequelize, DataTypes) => {
  const contact_filters = sequelize.define('contact_filters', {
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    list_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    type: {
      allowNull: false,
      defaultValue:'list',
      values : ['list','segment'],
      type: DataTypes.STRING
    },
    filterJson: {
      allowNull: false,
      type: DataTypes.JSON
    },
  }, {});
  contact_filters.associate = function (models) {

    // this.belongsTo(models.email_lists, {
    //   foreignKey: 'list_id',
    //   targetKey: 'id',
    //   as: 'email_list'
    // });

    // this.belongsTo(models.segment_lists, {
    //   foreignKey: 'list_id',
    //   targetKey: 'id',
    //   as: 'segment_list'
    // });

  };
  return contact_filters;
};