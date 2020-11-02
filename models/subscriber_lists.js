'use strict';
module.exports = (sequelize, DataTypes) => {
  const subscriber_lists = sequelize.define('subscriber_lists', {
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
      underscored: true,
      paranoid: true
  });
  subscriber_lists.associate = function(models) {
    // associations can be defined here
    this.hasMany(models.subscriber_mails, { foreignKey: "subscriber_list_id" });
    this.belongsToMany(models.campaigns, { as: 'subscriber_campaign_lists', through: 'campaign_subscriber_lists' });
  };
  return subscriber_lists;
};