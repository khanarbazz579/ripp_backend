'use strict';

module.exports = (sequelize, DataTypes) => {
    var companyDetail = sequelize.define('company_details', {
        custom_field_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        field_value: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        company_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        }
    }, { 
        underscored: true 
    });

    companyDetail.associate = function (models) {
        this.belongsTo(models.custom_fields, { 
            foreignKey: 'custom_field_id', 
            targetKey: 'id', 
            as: "custom_field" 
        });
    };

    return companyDetail;
};