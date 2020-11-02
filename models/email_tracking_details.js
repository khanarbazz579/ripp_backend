'use strict';
module.exports = (sequelize, DataTypes) => {
    var emailTrackingDetails = sequelize.define('email_tracking_details', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        tracking_code: {
            allowNull: false,
            type: "VARCHAR(60)"
        },
        mail_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        created_at: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updated_at: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        underscored: true,
    });

    return emailTrackingDetails;
};