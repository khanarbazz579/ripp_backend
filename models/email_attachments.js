'use strict';

module.exports = (sequelize, DataTypes) => {
  var emailAttachments = sequelize.define('email_attachments', {
           id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
        },
        email_id: {
          allowNull: false,
          type: DataTypes.INTEGER
        },
        email_attachment: {
          allowNull: false,
          type: DataTypes.TEXT
        },
        created_at: {
          allowNull: false,
          type: DataTypes.DATE
        },
        updated_at: {
          allowNull: false,
          type: DataTypes.DATE
        }
  }, {
    underscored: true,
  });
  return emailAttachments;
}; 




