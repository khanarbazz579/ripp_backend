'use strict';

module.exports = (sequelize, DataTypes) => {
    var salesStages = sequelize.define('sales_stages', {
        name: {
            type: DataTypes.STRING(191),
            allowNull :false
        },
        description: {
            defaultValue: null,
            type: DataTypes.STRING(191)
        },
        default_id: {
            type: DataTypes.INTEGER,
            defaultValue :0
        },
        close_probability: {
            defaultValue: 0,
            type: DataTypes.INTEGER,
            allowNull :false
        },
        priority_order : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
        is_pipeline : {
            type: DataTypes.BOOLEAN,
            defaultValue :true
        }
    }, { 
        underscored: true 
    });

    salesStages.associate = function(models){
        this.hasMany(models.leads_clients,{
            foreignKey : "sales_stage_id"
        });
        this.hasMany(models.stage_check_statuses,{
            foreignKey : "stage_id"
        });
    };
    
    return salesStages;
};