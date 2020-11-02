'use strict';
module.exports = (sequelize, DataTypes) => {
    var leadsClient = sequelize.define('leads_clients', {
        sales_stage_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue :1,
        },
        type: {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'LEAD',
            values : ['LEAD','CLIENT']
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        source: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, { 
        underscored: true 
    });

    leadsClient.associate = function (models) {
        this.belongsTo(models.sales_stages, { 
            foreignKey: 'sales_stage_id', 
            targetKey: 'id',
            as: 'sales_stage' 
        });
        this.belongsTo(models.users, { 
            foreignKey: 'user_id', 
            targetKey: 'id',
            as: 'user' 
        });
        this.belongsTo(models.users, { 
            foreignKey: 'owner', 
            targetKey: 'id',
            as: 'owner_name' 
        });
        this.hasOne(models.lost_lead_fields, { 
            foreignKey: "lead_client_id", 
            targetKey: 'id',
            as: "lost_lead_fields" 
        });
        this.hasOne(models.companies, { 
            foreignKey: "entity_id", 
            targetKey: 'id',
            as: "companies" 
        });
        // this.hasMany(models.histories, { 
        //     foreignKey: "lead_client_id", 
        //     targetKey: 'id', 
        //     as: "histories" 
        // });
        // this.hasMany(models.tasks, { 
        //     foreignKey: "lead_client_id", 
        //     targetKey: 'id', 
        //     as: "tasks" 
        // });
        this.hasMany(models.lead_client_details, { 
            foreignKey: "lead_client_id", 
            targetKey: 'id', 
            as: "lead_client_details",
            onDelete: "CASCADE" 
        });
        this.hasMany(models.contacts, { 
            foreignKey: "entity_id", 
            targetKey: 'id', 
            as: "contacts"
        });
    };

    return leadsClient;
};