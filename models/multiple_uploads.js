'use strict';

module.exports = (sequelize, DataTypes) => {
    var multipleUploads = sequelize.define('multiple_uploads', {
        ref_name: {
            type: DataTypes.STRING(191),
            allowNull :false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull :false
        },
        current_stage : {
            type: DataTypes.INTEGER,
            defaultValue :0
        },
        field_array: {
            type: DataTypes.TEXT,
            defaultValue :'',
            get: function () {
                    try {
                        return JSON.parse(this.getDataValue('field_array'));
                    } catch (e) {
                        return null;
                    }
             },
             set: function (value) {
                 this.setDataValue('field_array', JSON.stringify(value));
             },
        },
        error_count : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
        total_count : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
        duplicate_count : {
            type: DataTypes.INTEGER,
            defaultValue :0
        }
    }, { 
        underscored: true 
    });

    multipleUploads.associate = function(models){
       
        this.belongsTo(models.users,{
            foreignKey : "user_id",
            as : "user"
        });
    };
    
    return multipleUploads;
};