'use strict';

module.exports = (sequelize, DataTypes) => {
    var leadClientDetail = sequelize.define('lead_client_details', {
        custom_field_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        field_value: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        lead_client_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        }
    }, { 
        underscored: true 
    });

    leadClientDetail.associate = function (models) {
        this.belongsTo(models.custom_fields, { 
            foreignKey: 'custom_field_id', 
            targetKey: 'id', 
            as: "custom_field" 
        });
    };

    return leadClientDetail;
};