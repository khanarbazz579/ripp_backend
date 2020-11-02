'use strict';

module.exports = (sequelize, DataTypes) => {
    var call = sequelize.define('tasks', {
        task_type: {
            allowNull: true,
            type: DataTypes.ENUM('CALL', 'MEETING', 'EVENT'),
            defaultValue: 'CALL'
        },
        start: {
            allowNull: true,
            type: DataTypes.DATE,
        },
        end: {
            allowNull: true,
            type: DataTypes.DATE,
        },
        when_marked_complete: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        user_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        contact_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        marked_complete_by_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        is_completed: {
            allowNull: true,
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        priority: {
            allowNull: true,
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        reason_for_call: {
            allowNull: true,
            type: DataTypes.STRING
        },
        reminder: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        call_list_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        }
    }, { 
        underscored: true 
    });

    call.associate = function (models) {
        this.belongsTo(models.users, { 
            foreignKey: 'user_id', 
            targetKey: 'id',
            as: 'user' 
        });
        this.belongsTo(models.contacts, { 
            foreignKey: 'contact_id', 
            targetKey: 'id', 
            as: "contact" 
        });
        this.hasMany(models.call_details, { 
            foreignKey: "task_id", 
            targetKey: 'id', 
            as: "call_details",
            onDelete: "CASCADE" 
        });
        this.hasMany(models.call_outcomes_transitions, { 
            foreignKey: "task_id", 
            targetKey: 'id', 
            as: "call_outcomes",
            onDelete: "CASCADE"  
        });
    };

    call.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return call;
};