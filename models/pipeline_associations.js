'use strict';

module.exports = (sequelize, DataTypes) => {
    var piplineAssociation = sequelize.define('pipline_associations', {
        lead_client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pipeline_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        underscored: true
    });

    piplineAssociation.associate = function (models) {
        this.fields = this.belongsTo(models.leads_clients, {
            foreignKey: 'lead_client_id',
            targetKey: 'id',
            as: 'lead_client'
        });
    };

    return piplineAssociation;
};