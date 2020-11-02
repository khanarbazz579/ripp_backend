'use strict';

module.exports = (sequelize, DataTypes) => {
    var company = sequelize.define('companies', {
        name: {
            allowNull: false,
            type: DataTypes.STRING(191)
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
        }
    }, { underscored: true });

    company.associate = function (models){
        this.belongsTo(models.leads_clients, { 
            foreignKey: 'entity_id', 
            targetKey: 'id', 
            as: "lead_client" 
        });
        this.belongsTo(models.suppliers, { 
            foreignKey: 'entity_id', 
            targetKey: 'id', 
            as: "supplier" 
        });
        this.hasMany(models.company_details, { 
            foreignKey: 'company_id', 
            targetKey: 'id', 
            as: "company_details",
            onDelete: "CASCADE" 
        });
    };

    return company;
};