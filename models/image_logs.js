"use strict";

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define(
    "image_logs",
    {
      path: {
        type: DataTypes.STRING(191),
        unique: true,
        allowNull: false
      }
    },
    { underscored: true }
  );

  Model.prototype.toWeb = function(pw) {
    let json = this.toJSON();
    return json;
  };

  return Model;
};
