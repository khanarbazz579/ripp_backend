'use strict';

module.exports = (sequelize, DataTypes) => {
    var filesFolders = sequelize.define('files_folders', {
        original_name: {
            type: DataTypes.STRING(191)
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            defaultValue: null,
            type: DataTypes.DATE
        },
        entity_type: {
            type: DataTypes.ENUM,
            values: ["FOLDER", "FILE"],
            allowNull: false
        },
        is_guest:{
            type :DataTypes.BOOLEAN,
            defaultValue : false
        }
    }, { underscored: true });

    filesFolders.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    filesFolders.associate = function (models) {
        this.fields = this.belongsTo(models.users, {
            foreignKey: 'created_by',
            targetKey: 'id'
        });
        this.fields = this.belongsTo(models.share_guest_users, {
            foreignKey: 'created_by',
            targetKey: 'id',
        });
    };

    return filesFolders;
};
