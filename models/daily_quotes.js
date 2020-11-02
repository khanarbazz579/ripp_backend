'use strict';

module.exports = (sequelize, DataType) => {
    var quote = sequelize.define("daily_qoutes", {
        quote: {
			type: DataType.TEXT,
            allowNull: true,
        },

        author : {
            type : DataType.STRING(191),
            allowNull: true
        }
    },{underscored: true});

    return quote;
};
