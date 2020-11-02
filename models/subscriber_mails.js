'use strict';
module.exports = (sequelize, DataTypes) => {
  const subscriber_mails = sequelize.define('subscriber_mails', {
    subscriber_list_id: DataTypes.INTEGER,
    email: DataTypes.STRING
  }, {
      underscored: true,
      paranoid: true
  });
  subscriber_mails.associate = function(models) {
    // associations can be defined here
  };
  return subscriber_mails;
};