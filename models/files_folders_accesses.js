'use strict';

module.exports = (sequelize, DataTypes) => {
    var filesFoldersAccess = sequelize.define('files_folders_accesses', {
        file_folder_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        permission: {
            type: DataTypes.ENUM,
            values: ["VIEW", "EDIT"],
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(191), //file folder name
        },
        entity_type: {
            type: DataTypes.ENUM,
            values: ["FOLDER", "FILE"],
            allowNull: false
        },
        parent_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        file_property_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        refrence_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        master_name: {
            type: DataTypes.STRING(191)
        },
        count: {
            type: DataTypes.INTEGER
        },
        share_refrence_id: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        is_guest:{
            type :DataTypes.BOOLEAN,
            defaultValue : false
        }
    }, { underscored: true });

    filesFoldersAccess.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    filesFoldersAccess.associate = function (models) {
        this.file_folder = this.belongsTo(models.files_folders, {
            foreignKey: 'file_folder_id',
            targetKey: 'id',
            onDelete: 'cascade'
        });

        this.user = this.belongsTo(models.users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: 'user'
        });

       this.user = this.belongsTo(models.users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: 'owner'
        });

        this.guest_user = this.belongsTo(models.share_guest_users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: 'guest_user'
        });

        this.parent = this.belongsTo(models.files_folders_accesses, {
            foreignKey: 'parent_id',
            targetKey: 'id',
            onDelete: 'cascade'
        });

        this.fileProperty = this.belongsTo(models.file_properties, {
            foreignKey: 'file_property_id',
            targetKey: 'id',
            onDelete: 'cascade'
        });
    };

    return filesFoldersAccess;
};