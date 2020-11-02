'use strict';

module.exports = (sequelize, DataTypes) => {
    var currency = sequelize.define('currencies', {
        symbol: {
            allowNull: true,
            type:  DataTypes.STRING(191)
        },
        symbol_native: {
            allowNull: true,  
            type:  DataTypes.STRING(191)
        },
        name: {
            allowNull: true,
            type:  DataTypes.STRING(191)
        },
        decimal_digits: {
            allowNull: true,
            type:  DataTypes.INTEGER
        },
        rounding: {
            allowNull: true,
            type:  DataTypes.INTEGER
        },
        code: {
            allowNull: true,
            type:  DataTypes.STRING(191)
        },
        name_plural: {
            allowNull: true,
            type:  DataTypes.STRING(191)
        }
    }, { 
    	timestamps: false,
        underscored: true 
    });

    return currency;
};