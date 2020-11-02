'use strict';
module.exports = (sequelize, DataTypes) => {
  const clickedLink = sequelize.define('clicked_links', {
    id: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    subscriber_id: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    },
    template_link_id: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    }
  }, {
      underscored: true,
    });

  clickedLink.associate = function (models) {

    this.belongsTo(models.subscribers, {
      foreignKey: 'subscriber_id',
      targetKey: 'id',
      as: 'link_clicked_subscribers'
    });

    this.belongsTo(models.template_links, {
      foreignKey: 'template_link_id',
      targetKey: 'id',
      as: 'template_clicked_links',
      onDelete: "CASCADE"
    });

  };

  return clickedLink;
};
