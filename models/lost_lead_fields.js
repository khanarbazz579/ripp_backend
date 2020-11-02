'use strict';

module.exports = (sequelize, DataTypes) => {
    var lostLeadField = sequelize.define('lost_lead_fields', {
        lead_client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        lost_identifier: {
            type: DataTypes.STRING(191),
            allowNull: false
        }
    }, {
        underscored: true
    });

    lostLeadField.associate = function (models) {
        this.fields = this.belongsTo(models.leads_clients, {
            foreignKey: 'lead_client_id',
            targetKey: 'id'
        });
    };

    return lostLeadField;
};