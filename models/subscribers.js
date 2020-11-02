'use strict';
module.exports = (sequelize, DataTypes) => {
  const subscribers = sequelize.define('subscribers', {
    subscriber_id: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(191),
      allowNull: false,
      defaultValue: 'subscribed',
    },
    list_id: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },
    segment_id: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },
    hardbounce_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_hardbounce_at: {
      type: DataTypes.DATE
    }
  }, {});
  subscribers.associate = function (models) {

    this.belongsTo(models.email_lists, {
      foreignKey: 'list_id',
      targetKey: 'id',
      as: 'list_subcribers'
    });
    this.belongsTo(models.contacts, {
      foreignKey: 'subscriber_id',
      targetKey: 'id',
      as: 'subscriber'
    });

  };
  return subscribers;
};
