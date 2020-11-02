'use strict';

module.exports = (sequelize, DataTypes) => {

  var Model = sequelize.define('folders', {
    name: {
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
    type: {
      type: DataTypes.STRING(191)
    },
    // path: {
    //   type: DataTypes.TEXT
    // },
    parent_id: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    shared_with: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    master_name: {
      type: DataTypes.STRING(191)
    },
    count: {
      type: DataTypes.INTEGER
    }
  }, { underscored: true });


	Model.associate = function (models) {
		this.parentFolder = this.belongsTo(models.folders, {
			foreignKey: 'parent_id', 
			targetKey: 'id', 
			onDelete: 'cascade' 
		});
		this.user = this.belongsTo(models.users, { 
			foreignKey: 'created_by', 
			targetKey: 'id', 
			onDelete: 'cascade' 
		});
	};

	Model.prototype.toWeb = function (pw) {
		let json = this.toJSON();
		return json;
	};

	return Model;
};
