'use strict';
module.exports = (sequelize, DataTypes) => {
  const email_list_settings = sequelize.define('email_list_settings', {
    isReverseOrder: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    sortBy: {
      type: DataTypes.STRING(191),
      allowNull: true
    },
    By: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  email_list_settings.associate = function (models) {

    this.belongsTo(models.users, {
      foreignKey: "By",
      targetKey: "id"
    });

  };
  return email_list_settings;
};