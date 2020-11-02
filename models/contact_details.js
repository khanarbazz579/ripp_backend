'use strict';

module.exports = (sequelize, DataTypes) => {
    var contactDetail = sequelize.define('contact_details', {
        custom_field_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        field_value: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        contact_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
    }, { 
        underscored: true 
    });

    contactDetail.associate = function (models) {
        this.belongsTo(models.custom_fields, { 
            foreignKey: 'custom_field_id', 
            targetKey: 'id', 
            as: "custom_field" 
        });
    };

    return contactDetail;
};