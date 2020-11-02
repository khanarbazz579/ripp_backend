'use strict';

module.exports = (sequelize, DataTypes) => {
	var callLists = sequelize.define('call_lists', {
		name : {
			allowNull: false,
			type: DataTypes.STRING,
        },
        description : {
            allowNull: false,
            type: DataTypes.STRING
        },
        sechdule_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
		user_id: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
        include_existing_call_contact: {
            allowNull : false,
            type: DataTypes.BOOLEAN,
            default: false
        },
        custom_filter_id : {
            allowNull: false,
			type: DataTypes.INTEGER
        }
	}, {
		underscored: true,
	});

	callLists.associate = function (models){
        this.belongsTo(models.users, { 
            foreignKey: 'user_id', 
            targetKey: 'id',
            as: 'user' 
        });

        this.belongsTo(models.custom_filters, { 
            foreignKey: 'custom_filter_id', 
            targetKey: 'id',
            as: 'custom_filters' 
        });

        this.hasMany(models.tasks, { 
            foreignKey: 'call_list_id', 
            targetKey: 'id',
            as: 'tasks' 
        });
	};

	return callLists;
};