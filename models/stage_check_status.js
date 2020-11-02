'use strict';

module.exports = (sequelize, DataTypes) => {
    var stageCheckStatus = sequelize.define('stage_check_statuses', {
        stage_id: {
            type: DataTypes.INTEGER,
            allowNull :false
        },
        user_id : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        is_checked : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        },
        type : {
            type :DataTypes.ENUM,
            allowNull : false,
            defaultValue :'1',
            values : ['0','1','2','3'],
            comment: '0 - User, 1 - Lead , 2 -Client , 3-Supplier'
        }
    }, { 
        underscored: true 
    });

    return stageCheckStatus;
};