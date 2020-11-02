'use strict';

module.exports = (sequelize, DataTypes) => {
    var contactEntityFiles = sequelize.define('contact_entity_files', {
        contact_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        entity_file_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, { 
        underscored: true 
    });

    contactEntityFiles.associate = function (models) {
        this.belongsTo(models.entity_files, { 
            foreignKey: 'entity_file_id', 
            targetKey: 'id', 
            as: "file" 
        });
        this.belongsTo(models.contacts, { 
            foreignKey: 'contact_id', 
            targetKey: 'id', 
            as: "contact" 
        });
    };

    return contactEntityFiles;
};