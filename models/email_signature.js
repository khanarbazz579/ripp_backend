'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('email_signatures', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        file_path: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        file_name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        signature_text: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            defaultValue: null,
            type: DataTypes.DATE
        },
    }, {
        underscored: true
    });
    return Model;
};
