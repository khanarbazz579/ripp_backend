'use strict';
module.exports = (sequelize, DataTypes) => {
  const leads_shared_records = sequelize.define('leads_shared_records', {
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    access_type: {
      allowNull: false,
      type: DataTypes.ENUM('R', 'RW', 'RWX')
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {});
  leads_shared_records.associate = function (models) {
    // associations can be defined here
    this.belongsTo(models.users, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'user'
    });

    this.belongsTo(models.leads_clients, {
      foreignKey: 'lead_id',
      targetKey: 'id',
      as: 'lead_details'
    });

  };
  return leads_shared_records;
};