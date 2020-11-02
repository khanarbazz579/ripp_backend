'use strict';

module.exports = (sequelize, DataTypes) => {
    var history = sequelize.define('histories', {
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        contact_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        entity_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        entity_type: {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'NOTE',
            values : [
                "LEAD_CLIENT",
                "SUPPLIER",
                "OUTCOME_TRANSITION",
                "NOTE",
                "CALL",
                "INBOUND_CALL",
                "EVENT",
                "TODO",
            ]
        }
    } ,{ 
        underscored: true 
    });

    history.associate = function(models){
        this.belongsTo(models.users,{
            foreignKey: "user_id", 
            targetKey: 'id',
            as: "user"
        });
        this.belongsTo(models.contacts,{  
            foreignKey: "contact_id", 
            targetKey: 'id',
            as: 'contact'
        });
        this.belongsTo(models.notes, { 
            foreignKey: 'entity_id', 
            targetKey: 'id', 
            as: "note" 
        });
        this.belongsTo(models.events, { 
            foreignKey: 'entity_id', 
            targetKey: 'id', 
            as: "event" 
        });
        this.belongsTo(models.call_outcomes_transitions, { 
            foreignKey: 'entity_id', 
            targetKey: 'id', 
            as: "outcome" 
        });
    };
 
    return history;
}; 