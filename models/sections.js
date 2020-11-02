'use strict';

module.exports = (sequelize, DataTypes) => {
	var section = sequelize.define('sections', {
		name: {
			type: DataTypes.STRING(191),
		},
		description: {
			allowNull: true,
			type: DataTypes.STRING(191)
		},
		type: {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'LEAD_CLIENT',
            values : [
                'LEAD_CLIENT', 
                'LEAD_CLIENT_CONTACT', 
                'LEAD_CLIENT_COMPANY',
                'SUPPLIER',
                'SUPPLIER_CONTACT', 
                'SUPPLIER_COMPANY',
                'CALL',
                'USER', 
            ],
        },
		priority_order: {
			defaultValue: 0,
			type: DataTypes.INTEGER
		},
        client_priority_order: {
            type: DataTypes.INTEGER,
            defaultValue : 0
        },
        restrict_action: {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'0',
            values : [
                '0', 
                '1', 
                '2',
                '3',
                '4', 
                '5',
                '6',
                '7', 
            ],
            comment: '0-Allow all, 1-restrict delete, 2-restrict edit, 3-restrict move, 4-restrict delete & edit, 5-restrict delete & move, 6-restrict move & edit, 7-restrict all'
        },
        allow_add_fields: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_hidden: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
	}, { 
		underscored: true 
	});

	section.associate = function(models){
        this.customFields = this.hasMany(models.custom_fields, {
			foreignKey: "section_id",
			as: "custom_fields",
			onDelete: "CASCADE"  
        });

        section.hasOne(models.permission, {
            foreignKey: 'section_id',
            onDelete: 'cascade'
        });
    };

	section.prototype.toWeb = function (pw) {
		let json = this.toJSON();
		return json;
	};

	return section;
};