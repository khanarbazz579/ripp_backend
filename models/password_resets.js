'use strict';

module.exports = (sequelize, DataTypes) => {
    var passwordReset = sequelize.define('password_resets', {
        email: {
            type: DataTypes.STRING(191),
            primaryKey: true
        },
        token: {
            type: DataTypes.STRING(191)
        },
        generated: {
            type: DataTypes.STRING(191),
        },
        expired_at: {
            type: DataTypes.STRING(191),
        }
    }, {
        underscored: true,
        timestamps: false
    });

    passwordReset.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return passwordReset;
};
