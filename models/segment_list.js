'use strict';
module.exports = (sequelize, DataTypes) => {
  const segment_lists = sequelize.define('segment_lists', {
    segment_name: {
      type: DataTypes.STRING(191),
      allowNull: false
    },
    segment_description: {
      type: DataTypes.STRING(191),
      allowNull: true
    },
    criteria_id: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    list_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priority_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  segment_lists.associate = function (models) {

    this.belongsTo(models.email_lists, {
      foreignKey: 'list_id',
      targetKey: 'id',
      as: 'segment'
    });

    this.belongsTo(models.users, {
      foreignKey: "created_by",
      targetKey: "id",
      as: "By"
    });

    this.hasMany(models.contact_filters, {
      foreignKey: 'list_id',
      targetKey: 'id',
      as: "filter"
    });


  };
  return segment_lists;
};