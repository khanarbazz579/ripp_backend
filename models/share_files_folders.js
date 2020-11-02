'use strict';

module.exports = (sequelize, DataTypes) => {
    var filesFolders = sequelize.define('share_files_folders', {
        file_folder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        file_folder_access_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        permission:{
            type: DataTypes.ENUM,
            values: ['EDIT', 'VIEW'],
            defaultValue: 'VIEW'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['SHARED', 'MOVED', 'REJECTED'],
            defaultValue: 'SHARED'
        },
        user_type: {
            type: DataTypes.ENUM,
            values: [
                "CONTACT",
                "SHARE_GUEST",
                "USER"
            ],
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            defaultValue: null,
            type: DataTypes.DATE
        },
        share_parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, { underscored: true });

    filesFolders.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    filesFolders.associate = function (models) {
        this.belongsTo(models.users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as:"user"
        });
        this.belongsTo(models.users, {
            foreignKey: 'created_by',
            targetKey: 'id',
            as: 'owner'
        });
        this.belongsTo(models.share_guest_users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as:"guest_user"
        });
        this.belongsTo(models.files_folders, {
            foreignKey: 'file_folder_id',
            targetKey: 'id'
        });
        this.belongsTo(models.files_folders_accesses, {
            foreignKey: 'file_folder_access_id',
            targetKey: 'id'
        });
    };

    return filesFolders;
};

