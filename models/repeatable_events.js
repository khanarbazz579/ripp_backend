'use strict';

module.exports = (sequelize,DataType) => {
    let repeatableEvent = sequelize.define("repeatable_events",{
        title : {
            type : DataType.STRING(191)
        },
        type : {
            type : DataType.ENUM,
            values : ['meeting', 'annualLeave', 'personal']
        },
        color : {
            type : DataType.ENUM,
            values : ['red','orange', 'green', 'yellow', 'purple', 'pink', 'blue', 'brown']
        },
        location  : {
            type :DataType.STRING(191)
        },
        start : {
            type : DataType.DATE
        },
        end : {
            type : DataType.DATE
        },
        details : {
            type : DataType.STRING(191)
        },
        is_multiday : {
            type :DataType.BOOLEAN,
            defaultValue : false
        },
        user_id : {
            type : DataType.INTEGER
        },
        contact_id : {
            type : DataType.INTEGER
        },
        lead_client_id : {
            type :DataType.INTEGER
        },
        email_reminder : {
            type : DataType.BOOLEAN,
            defaultValue: false
        },
        meeting_room_id : {
            type :DataType.INTEGER,
            allowNull : true
        },
        text_reminder : {
            type : DataType.BOOLEAN,
            defaultValue : false
        },
        repeat_every : {
            type : DataType.INTEGER,
            defaultValue : 1
        },
        repeat_type : {
            type : DataType.ENUM,
            values : ['daily', 'weekday', 'weekly', 'monthly']
        },
        target_repeat_day : {
            type : DataType.STRING(191)
        },
        continue : {
            type : DataType.ENUM,
            values : ['forever', 'until', 'for'],
            defaultValue : 'forever'
        },
        for_recurence : {
            type : DataType.INTEGER
        },
        until_recurence : {
           type : DataType.DATE
        },
        week_day_occurence : {
            type : DataType.STRING(191)
        }
    },{
        underscored: true
    });

    return repeatableEvent;
};