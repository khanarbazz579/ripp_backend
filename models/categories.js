'use strict';

module.exports = (sequelize, DataType) => {
    var categories = sequelize.define("categories", {
        name: {
            type: DataType.STRING(191),
            allowNull: false
        },
        user_id : {
            type :DataType.INTEGER,
            allowNull : true
        },
        createdAt: {
            type: DataType.DATE(3),
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3)'),
            field: 'created_at',
        },
        updatedAt: {
            type: DataType.DATE(3),
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'),
            field: 'updated_at',
        },
    },{underscored: true});

    categories.associate = function (models) {
        this.hasMany(models.todos, {
            foreignKey: 'category_id',
            targetKey: 'id',
            //as: 'cat'
        });
    };

    return categories;
};
