'use strict';

module.exports = (sequelize, DataType) => {
    var event = sequelize.define("events", {
        title: {
            type: DataType.STRING(191),
            allowNull: false
        },

        color: {
            type: DataType.ENUM,
            values: ['red', 'orange', 'green', 'yellow', 'purple', 'pink', 'blue', 'brown'],
            defaultValue: 'purple'

        },

        type: {
            type: DataType.ENUM,
            values: ['meeting', 'annualLeave', 'personal']
        },
        location: {
            type: DataType.STRING(191)
        },
        start: {
            type: DataType.DATE
        },
        end: {
            type: DataType.DATE
        },

        details: {
            type: DataType.STRING(191)
        },

        is_all_day: {
            type: DataType.BOOLEAN,
            defaultValue: false
        },

        is_send_email: {
            type: DataType.BOOLEAN,
            defaultValue: false
        },
        is_meeting_room: {
            type: DataType.BOOLEAN,
            defaultValue: false
        },
        is_end: {
            type: DataType.BOOLEAN,
            defaultValue: false
        },
        is_end_time: {
            type: DataType.BOOLEAN,
            defaultValue: false
        },
        user_id: {
            type: DataType.INTEGER,
            allowNull: false
        },
        meeting_room_id: {
            type: DataType.INTEGER,
            allowNull: true
        },

        text_reminder: {
            type: DataType.STRING(191),
            allowNull: true
        },


    }, { underscored: true });

    event.associate = function(models) {
        this.belongsTo(models.users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: "user"
        });
    }

    return event;
};