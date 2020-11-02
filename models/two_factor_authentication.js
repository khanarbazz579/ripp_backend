'use strict';

module.exports = (sequelize, DataTypes) => {
    var twoFactorAuthentications = sequelize.define('user_two_factor_authentications', {
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        browser: {
            allowNull: true,
            type: DataTypes.STRING(256),
        },
        location: {
            allowNull: true,
            type: DataTypes.STRING(256),
        },
        ip_address: {
            allowNull: true,
            type: DataTypes.STRING(256),
        },
        auth_code: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        status: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
        },
        remember_device: {
            allowNull: true,
            type: DataTypes.BOOLEAN,
        },
        auth_error: {
            allowNull: true,
            type: DataTypes.STRING(256),
        }
    }, {
        underscored: true,
    });

    return twoFactorAuthentications;
};