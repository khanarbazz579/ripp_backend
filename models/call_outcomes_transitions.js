'use strict';

module.exports = (sequelize, DataTypes) => {
  	var callOutcomesTransition = sequelize.define('call_outcomes_transitions', {
      	start_time: {
            allowNull: true,
            type: DataTypes.DATE
        },
        end_time: {
            allowNull: true,
            type: DataTypes.DATE
        },
        task_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        outcome_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        }
  	}, {
        underscored: true
    });

    callOutcomesTransition.associate = function(models){
        this.belongsTo(models.call_outcomes,{  
            foreignKey: "outcome_id", 
            targetKey: 'id',
            as: "outcome"
        });
        this.belongsTo(models.users,{  
            foreignKey: "user_id", 
            targetKey: 'id',
            as: "user"
        });
        this.belongsTo(models.tasks,{  
            foreignKey: "task_id", 
            targetKey: 'id',
            as: "task"
        });
    };

  	return callOutcomesTransition;
};