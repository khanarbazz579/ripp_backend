'use strict';

module.exports = (sequelize, DataTypes) => {
    var notification = sequelize.define('notifications', {
        type: {
            type: DataTypes.ENUM,
            allowNull: false,
            defaultValue: 'CALL',
            values: [
                "CALL",
                "EVENT",
                "EVENT_ACCEPT",
                "EVENT_REJECT",
                "EVENT_MAYBE",
                "TODO",
                "EMAIL"
            ]
        },
        target_time: {
            type: DataTypes.DATE
        },
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        target_event_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        recipients_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        is_read: {
            type: DataTypes.BOOLEAN,
        },
        is_miss: {
            type: DataTypes.BOOLEAN,
        }
    }, {
        underscored: true
    });

    notification.associate = function(models) {
        this.belongsTo(models.users, {
            foreignKey: "user_id",
            targetKey: "id",
            as: "user"
        })
        this.belongsTo(models.tasks, {
            foreignKey: "target_event_id",
            targetKey: "id",
            as: "task"
        })
        this.belongsTo(models.todos, {
            foreignKey: "target_event_id",
            targetKey: "id",
            as: "todo"
        })
        this.belongsTo(models.events, {
            foreignKey: "target_event_id",
            targetKey: "id",
            as: "event"
        })
        this.belongsTo(models.event_recipients, {
            foreignKey: "recipients_id",
            targetKey: "id",
            as: "event_recipient"
        })
        this.belongsTo(models.global_notification_settings, {
            foreignKey: "type",
            targetKey: "type",
            as: "notification_type"
        })
        this.belongsTo(models.file_notification_details, {
            foreignKey: "target_event_id",
            targetKey: "id",
            as: "file_notification_detail"
        })
        this.belongsTo(models.emails, {
            foreignKey: "target_event_id",
            targetKey: "id",
            as: "emails"
        })
    };

    return notification;
};