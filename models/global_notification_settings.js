'use strict';
module.exports = (sequelize, DataTypes) => {
    var globalNotificationSetting = sequelize.define('global_notification_settings', {
        type : {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'CALL',
            values : [
                "CALL",
                "EVENT",
                "EVENT_ACCEPT",
                "EVENT_REJECT",
                "EVENT_MAY_BE",
                "TODO",
                "EMAIL",
                "LEAD",
                "CLIENT",
                "SUPPLIER",
                "USER_MEDIA",
            ]
        },
        is_active : {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    } ,{ 
        underscored: true 
    });

    return globalNotificationSetting;
}; 