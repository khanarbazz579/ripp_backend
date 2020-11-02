'use strict';

module.exports = (sequelize, DataTypes) => {
    var emails = sequelize.define('emails', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        subject: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        conversation_id: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        email_online_id: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        lead_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        provider: {
            allowNull: true,
            type: "VARCHAR(250)"
        },
        email_user: {
            allowNull: true,
            type: "VARCHAR(250)"
        },
        tracking_code: {
            allowNull: true,
            type: "VARCHAR(250)"
        },
        parent_id: {
            allowNull: true,
            type: "VARCHAR(250)"
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

    emails.associate = function(models) {
        this.hasMany(models.email_user_details, {
            as: "email_user_details",
            foreignKey: "email_id",
        });

        this.hasMany(models.emails, {
            as: "child_emails",
            foreignKey: "parent_id",
        });

        this.belongsTo(models.users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: "from_user",
        });

        this.hasMany(models.email_tracking_details, {
            as: "email_tracking_details",
            foreignKey: "mail_id"
        });
    };
    return emails;
};