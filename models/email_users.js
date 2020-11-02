'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('email_users', {
        email_provider_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        email_user_name: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        email_user_password: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        email_host: {
            defaultValue: null,
            type: DataTypes.STRING(191),
            allowNull: true
        },
        email_port: {
            defaultValue: null,
            type: DataTypes.INTEGER,
            allowNull: true
        },
        use_ssl:{
            defaultValue:null,
            type:DataTypes.BOOLEAN,
            allowNull:true
        },
        
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            defaultValue: null,
            type: DataTypes.DATE
        },
        type: {
            defaultValue: null,
            type: DataTypes.STRING(50),
            allowNull:true
        }
    }, {
            underscored: true
        });

    Model.associate = function (models) {
        this.fields = this.belongsTo(models.email_providers, {
            foreignKey: 'email_provider_id',
            targetKey: 'id'
        });
        // this.fields = this.belongsTo(models.email_providers, {
        //     foreignKey: 'email_provider_id',
        //     targetKey: 'id'
        // });
    };

    return Model;
};

// ////type: {
//     defaultValue: null,
//     type: DataTypes.BOOLEAN
// }