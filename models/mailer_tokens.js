'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('mailer_tokens', {
        mailer_token_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        email_user: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        mailer_token: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        mailer_refresh_token: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            defaultValue: null,
            type: DataTypes.DATE
        },
        status: {
            defaultValue: 'Pending',
            type: DataTypes.STRING(100)
        },
        user_id: {
            defaultValue: null,
            type: DataTypes.INTEGER
        }
    }, {
        underscored: true
    });

    return Model;
};