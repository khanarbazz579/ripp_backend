'use strict';

module.exports = (sequelize, DataTypes) => {
    var formDefaultField = sequelize.define('form_default_fields', {
        name: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        custom_field_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        is_required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        model_name: {
            type : DataTypes.STRING(191),
            allowNull : true
        },
        item_type: {
            type :DataTypes.ENUM,
            allowNull : false,
            defaultValue :'0',
            values : ['0','1','2','3'],
            comment: '0 - User, 1 - Lead , 2 -Client , 3-Supplier'
        },
        priority_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        underscored: true
    });

    formDefaultField.associate = function(models){
        this.belongsTo(models.custom_fields,{  
            foreignKey: "custom_field_id", 
            targetKey: 'id',
            as: 'custom_field'
        });
    };

    return formDefaultField;
};