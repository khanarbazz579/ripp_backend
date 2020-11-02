'use strict';

module.exports = (sequelize, DataTypes) => {

  var file = sequelize.define('files', {
    name: {
      type: DataTypes.STRING(191),
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE
    },
    updated_at: {
      defaultValue: null,
      type: DataTypes.DATE
    },
    size: {
      type: DataTypes.STRING(191),
    },
    path: {
      type: DataTypes.STRING(191),
      unique: true
    },
    type: {
      type: DataTypes.STRING(191)
    }, 
    extension_type: {
      type: DataTypes.STRING(191),
      allowNull: true
    },
    folder_id: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    refrence_id: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    tag: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    description: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    shared_with: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    master_name : {
      type: DataTypes.STRING(191)
    },
    count: {
      type: DataTypes.INTEGER
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


	file.associate = function (models) {
		this.parentFolder = this.belongsTo(models.folders, { 
			foreignKey: 'folder_id', 
			targetKey: 'id', 
			onDelete: 'cascade' 
		});
		this.user = this.belongsTo(models.users, { 
			foreignKey: 'created_by', 
			targetKey: 'id', 
			onDelete: 'cascade' 
		});
	};

	file.prototype.toWeb = function (pw) {
		let json = this.toJSON();
		return json;
	};

	return file;
};
