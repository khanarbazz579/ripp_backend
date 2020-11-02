'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('email_providers', {
        email_provider_name: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            defaultValue: null,
            type: DataTypes.DATE
        }
    },
        {
            underscored: true
        }
    );

    return Model;
};