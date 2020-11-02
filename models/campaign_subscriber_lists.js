'use strict';
module.exports = (sequelize, DataTypes) => {
    const campaign_subscriber_lists = sequelize.define('campaign_subscriber_lists', {
        campaign_id: DataTypes.INTEGER,
        subscriber_list_id: DataTypes.INTEGER
    }, {
            underscored: true
        });
    campaign_subscriber_lists.associate = function (models) {
        // associations can be defined here
    };
    return campaign_subscriber_lists;
};