const StatusService = require('../services/campaignService');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const campaigns = sequelize.define('campaigns', {
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email_template_id: DataTypes.INTEGER,
    from_name: DataTypes.STRING,
    from_email: DataTypes.STRING,
    reply_email: DataTypes.STRING,
    subject_line: DataTypes.STRING,
    preheader_text: DataTypes.STRING,
    scheduled_time: DataTypes.DATE,
    status: DataTypes.TINYINT,
    email_percentage: DataTypes.FLOAT,
    is_scheduled: DataTypes.TINYINT,
    email_template_html: DataTypes.TEXT,
    list_headers: DataTypes.STRING
  }, {
      underscored: true,
      paranoid: true,
      getterMethods: {
        status_name() {
          //  if(this.getDataValue('deleted_at')==null)
          //  {
          let get_status = this.getDataValue('status');
          return StatusService.getstatus()[get_status];
          //  }
          return "DELETED";
        },
        is_scheduled() {
          let is_scheduled = this.getDataValue('is_scheduled');
          if (1 == is_scheduled) {
            return true;
          } else if (0 == is_scheduled) {
            return false;
          } else {
            return null;
          }
        }
      }

    });
  campaigns.associate = function (models) {
    // associations can be defined here
    this.belongsToMany(models.subscriber_lists, { as: 'our_subscribers', through: 'campaign_subscriber_lists' });
  };
  return campaigns;
};