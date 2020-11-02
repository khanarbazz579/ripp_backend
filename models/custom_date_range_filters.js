'use strict';

module.exports = (sequelize, DataTypes) => {
    var custom_date_range_filter = sequelize.define('custom_date_range_filters', {
        type: {
            type: DataTypes.ENUM,
            allowNull: false,
            defaultValue: 'TODO',
            values: [
                "TODO",
                "LEAD_CLIENT"
            ]
        },
        start_date: {
            type: DataTypes.DATE
        },
        end_date: {
            type: DataTypes.DATE
        },
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        }
    }, {
        underscored: true
    });

    custom_date_range_filter.associate = function(models) {
        this.belongsTo(models.users, {
            foreignKey: "user_id",
            targetKey: "id",
            as: "user"
        })
    };

    return custom_date_range_filter;
};