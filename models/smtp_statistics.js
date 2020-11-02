'use strict';
module.exports = (sequelize, DataTypes) => {
  const smtp_statistics = sequelize.define('smtp_statistics', {
    subscriber_id: {
      type: DataTypes.INTEGER,
      allowNull : false,
    },
    list_id: {
      type: DataTypes.INTEGER,
      allowNull : false,
    },
    event: {
      type: DataTypes.STRING,
      allowNull : false,
    },
    user_agent: {
      type: DataTypes.STRING
    },
    time_stamp: {
      type: DataTypes.DATE,
      allowNull : false,
    },
    response: {
      type: DataTypes.JSON
    }
  }, {});
  smtp_statistics.associate = function (models) {
    // associations can be defined here
    this.belongsTo(models.subscribers, {
      foreignKey: 'subscriber_id',
      targetKey: 'id',
      as: 'contacts',
      onDelete: 'cascade' 
    });

    this.belongsTo(models.email_lists, {
      foreignKey: 'list_id',
      targetKey: 'id',
      as: 'list'
    });

  };
  return smtp_statistics;
};