'use strict';
module.exports = (sequelize, DataTypes) => {
  const email_lists = sequelize.define('email_lists', {
    list_name: {
      type: DataTypes.STRING(191),
      allowNull: false
    },
    list_description: {
      type: DataTypes.STRING(191),
      allowNull: true
    },
    from_name: {
      type: DataTypes.STRING(191),
      allowNull: true
    },
    from_email: {
      type: DataTypes.STRING(191),
      allowNull: true
    },
    reply_email: {
      type: DataTypes.STRING(191),
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priority_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  email_lists.associate = function (models) {

    this.hasMany(models.segment_lists, {
      foreignKey: 'list_id',
      targetKey: 'id',
      as: 'segments',
      onDelete: "CASCADE"
    });

    this.hasMany(models.subscribers, {
      foreignKey: 'list_id',
      targetKey: 'id',
      as: 'subscribers'
    });

    this.belongsTo(models.users, {
      foreignKey: "created_by",
      targetKey: "id",
      as: "By"
    });

  };
  return email_lists;
};