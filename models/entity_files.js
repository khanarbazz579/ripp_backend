'use strict';

module.exports = (sequelize, DataTypes) => {

	var entityFile = sequelize.define('entity_files', {
		name: {
			type: DataTypes.STRING(191),
			allowNull: true
		},
		created_by: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		entity_type: {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'LEAD_CLIENT',
            values : ['LEAD_CLIENT','SUPPLIER'],
            comment : 'LEAD_CLIENT : belongs to lead_client, SUPPLIER : belongs to supplier'
        },
        entity_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        file_category_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
		size: {
			type: DataTypes.STRING(191),
			allowNull: true
		},
		path: {
			type: DataTypes.STRING(191),
			unique: true
		},
		icon_path: {
			type: DataTypes.STRING(191),
			unique: true
		},
		mimetype: {
			type: DataTypes.STRING(191),
			allowNull: true,
		}, 
		extension_type: {
			type: DataTypes.STRING(191),
			allowNull: true
		},
		width: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		height: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		quality: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		aspect_ratio: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		count: {
			type: DataTypes.INTEGER,
            defaultValue : 0,
			allowNull : false,
		},
	}, { 
		underscored: true 
	});


	entityFile.associate = function (models) {
		this.belongsTo(models.leads_clients, { 
			foreignKey: 'entity_id', 
			targetKey: 'id', 
			as: "lead_client",
		});
		this.belongsTo(models.suppliers, { 
			foreignKey: 'entity_id', 
			targetKey: 'id', 
			as: "supplier",
		});
		this.belongsTo(models.users, { 
			foreignKey: 'created_by', 
			targetKey: 'id', 
			onDelete: 'cascade' 
		});
		this.belongsTo(models.file_categories, { 
			foreignKey: 'file_category_id', 
			targetKey: 'id', 
			onDelete: 'cascade' 
		});
		this.hasMany(models.contact_entity_files, {
            foreignKey: 'entity_file_id',
            targetKey: 'id',
            as: "associate_contacts",
            onDelete: "CASCADE"
        });
	};

	return entityFile;
};
