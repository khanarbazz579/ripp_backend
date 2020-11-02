'use strict'; 

module.exports = (sequelize, DataTypes) => {
    
    var fileNotificationDetail = sequelize.define('file_notification_details', {
        entity_type: {
            type : DataTypes.ENUM,
            allowNull : false,
            defaultValue :'LEAD_CLIENT',
            values : ['LEAD_CLIENT','SUPPLIER', 'FILE'],
            comment : 'LEAD_CLIENT : belongs to lead_client, SUPPLIER : belongs to supplier, FILE : belongs to file'
        },
        entity_id: {
            allowNull: false,   
            type: DataTypes.INTEGER
        },
        file_name: {
            allowNull: true,   
            type: DataTypes.STRING
        },
        file_id: {
            allowNull: true,   
            type: DataTypes.INTEGER
        },
        progress: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_read: {
            type: DataTypes.BOOLEAN,
        },
        user_id: {
            allowNull: false,   
            type: DataTypes.INTEGER
        }
    }, { 
        underscored: true 
    });

    fileNotificationDetail.associate = function(models) {
        this.belongsTo(models.leads_clients, {
            foreignKey: "entity_id",
            targetKey: "id",
            as: "lead_client"
        })
        this.belongsTo(models.suppliers, {
            foreignKey: "entity_id",    
            targetKey: "id",
            as: "supplier"
        })
        this.belongsTo(models.entity_files, {
            foreignKey: "entity_id",
            targetKey: "id",
            as: "entity_file"
        })
    };

    return fileNotificationDetail;
};
