'use strict';

module.exports = (sequelize, DataTypes) => {
    var salesStageTransition = sequelize.define('sales_stage_transitions', {
        current_ss_id: {
            type: DataTypes.INTEGER,
            allowNull :false
        },
        old_ss_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        lead_client_id : {
            type : DataTypes.INTEGER,
            allowNull :false
        }
    }, { 
        underscored: true 
    });

    salesStageTransition.associate = function(models){
       this.transitions = this.belongsTo(models.leads_clients,{
           foreignKey : "lead_client_id",
           targetKey: 'id' ,
           as: "lead_client",
           onDelete: "CASCADE" 
        });
    };

    return salesStageTransition;
};