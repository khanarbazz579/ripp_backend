'use strict';

module.exports = (sequelize, DataTypes) => {
    var customFilterField = sequelize.define('custom_filter_fields', {
        custom_field_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        custom_filter_id : {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        option: {
            allowNull: false,
            type: DataTypes.STRING(191)
        },
        value: {
            type: DataTypes.STRING(191),
            defaultValue : '',
        },
        type : {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'LEAD',
            values : ['LEAD','CLIENT','SUPPLIER'],
            comment: '1 - Lead, 2 - Client, 3 - Supplier'
        }
    } ,{ 
        underscored: true 
    });

    customFilterField.associate = function(models){
        this.belongsTo(models.custom_fields,{ 
            foreignKey: "custom_field_id", 
            targetKey: 'id',
            as : "custom_field"
        });
    };

    return customFilterField;
}; 