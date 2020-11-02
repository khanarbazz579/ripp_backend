'use strict';
module.exports = (sequelize, DataTypes) => {
  const templateLinks = sequelize.define('template_links', {
    id: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    text: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    href: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    list_id: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    },
    campaign_id: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    }
  }, {
      underscored: true,
    });

  templateLinks.associate = function (models) {
    this.hasMany(models.clicked_links, {
      foreignKey: 'template_link_id',
      targetKey: 'id',
      as: 'template_clicked_links',
      onDelete: "CASCADE"
    });

  };

  return templateLinks;
};
