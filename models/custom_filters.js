'use strict';

module.exports = (sequelize, DataTypes) => {
    var customFilter = sequelize.define('custom_filters', {
        name: {
            allowNull: false,
            type: DataTypes.STRING(191)
        },
        user_id : {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        type : {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'LEAD',
            values : ['LEAD','CLIENT','SUPPLIER','CALL','CALL_LIST'],
            comment: '1 - Lead, 2 - Client, 3 - Supplier, 4 - Call, 5 - CALL_LIST'
        },
        priority_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        additional_attributes :{
            type: DataTypes.TEXT,
            allowNull: true,
            get: function () {
                try{
                    return JSON.parse(this.getDataValue('additional_attributes'));  
                }catch(exception){
                    return this.getDataValue('additional_attributes')
                }
                
            },
            set: function (value) {
                try{
                    this.setDataValue('additional_attributes', JSON.stringify(value));
                }catch(exception){
                    return '';
                }
               
            }
        },
        is_checked : {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull : false,
        }
    } ,{ underscored: true });

    customFilter.associate = function(models){
        this.belongsTo(models.users,{
            foreignKey : "user_id",
            targetKey: "id", 
            as : "user"
        })
        this.hasMany(models.custom_filter_fields,{
            foreignKey : "custom_filter_id", 
            as : "fields",
            onDelete : "CASCADE"
        });

        this.hasOne(models.call_lists, { 
            foreignKey: 'custom_filter_id', 
            targetKey: 'id',
            as: 'call_list',
            onDelete : "CASCADE"
        });
    };

    return customFilter;
}; 