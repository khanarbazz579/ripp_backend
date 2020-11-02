'use strict';

module.exports = (sequelize, DataTypes) => {
    var country = sequelize.define('countries', {
        country_code: {
            allowNull: false,
            type: DataTypes.STRING(191)
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING(191)
        }
    }, {
        timestamps: false,
        underscored: true 
    });

    return country;
};