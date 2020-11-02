'use strict';

module.exports = (sequelize, DataTypes) => {
    var filesProperties = sequelize.define('file_properties', {
        file_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        size: {
            type: DataTypes.STRING(191),
        },
        path: {
            type: DataTypes.STRING(191),
            unique: true
        },
        iconpath: {
            type: DataTypes.STRING(191),
            unique: true
        },
        mimetype: {
            type: DataTypes.STRING(191) //image/jpg
        },
        extension_type: {
            type: DataTypes.STRING(191),
            allowNull: true
        },
        tag: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        description: {
            allowNull: true,
            type: DataTypes.TEXT
        },
        width: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        height: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        quality: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        aspect_ratio: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, { underscored: true });

    filesProperties.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    filesProperties.associate = function (models) {
        this.fields = this.belongsTo(models.files_folders, {
            foreignKey: 'file_id',
            targetKey: 'id'
        });
    };

    return filesProperties;
};