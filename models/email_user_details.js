'use strict';

module.exports = (sequelize, DataTypes) => {
    var emailUserDetails = sequelize.define('email_user_details', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        email_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        user_email: {
            allowNull: true,
            type: "VARCHAR(250)"
        },
        tracking_code: {
            allowNull: false,
            type: "VARCHAR(60)"
        },
        user_type: {
            allowNull: true,
            type: "VARCHAR(60)"
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


    emailUserDetails.associate = function(models) {
        this.belongsTo(models.contacts, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: "contacts",
        });
    };


    return emailUserDetails;
};