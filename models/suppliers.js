'use strict';
module.exports = (sequelize, DataTypes) => {
    var supplier = sequelize.define('suppliers', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        }
    }, { 
        underscored: true 
    });

    supplier.associate = function (models) {
		this.hasMany(models.supplier_details, {
			foreignKey: 'supplier_id',
            as: "supplier_details",
            onDelete: "CASCADE" 
        });
        this.hasOne(models.companies, { 
            foreignKey: "entity_id", 
            targetKey: 'id',
            as: "companies" 
        });
        this.hasMany(models.contacts, { 
            foreignKey: "entity_id", 
            targetKey: 'id', 
            as: "contacts",
            onDelete: "CASCADE" 
        });
	};

    return supplier;
};