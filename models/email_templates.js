"use strict";

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define(
    "email_templates",
    {
      name: {
        type: DataTypes.STRING(191),
        allowNull: false
      },

      created_at: {
        type: DataTypes.DATE
      },

      path: {
        type: DataTypes.STRING(191),
        unique: true,
        allowNull: false
      },

      type: {
        type: DataTypes.ENUM,
        values: ["default", "custom"],
        allowNull: false
      }
    },
    { underscored: true }
  );

  Model.associate = function(models) {
    this.user = this.belongsTo(models.users, {
      foreignKey: "created_by",
      targetKey: "id",
      onDelete: "cascade"
    });
  };

  Model.prototype.toWeb = function(pw) {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
