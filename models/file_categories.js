'use strict';

module.exports = (sequelize, DataType) => {
    var categories = sequelize.define("file_categories", {
        name: {
            type: DataType.STRING(191),
            allowNull: false
        },
        user_id : {
            type: DataType.INTEGER,
            allowNull : true
        },
        created_at: {
            type: DataType.DATE(3),
        },
        updated_at: {
            type: DataType.DATE(3),
        },
    },{underscored: true});

    return categories;
};
