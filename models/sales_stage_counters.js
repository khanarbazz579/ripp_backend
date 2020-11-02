'use strict';

module.exports = (sequelize, DataTypes) => {
    var salesStageCounter = sequelize.define('sales_stage_counters', {
        sales_stage_id: {
            type: DataTypes.INTEGER,
            allowNull :false
        },
        entry_count: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        exit_count : {
            type : DataTypes.INTEGER,
            allowNull :false
        }
    }, {
        underscored: true 
    });

    salesStageCounter.associate = function (models) {
        this.fields = this.belongsTo(models.sales_stages, {
            foreignKey: 'sales_stage_id',
            targetKey: 'id',
            as: 'sales_stage'
        });
    };

    return salesStageCounter;
};