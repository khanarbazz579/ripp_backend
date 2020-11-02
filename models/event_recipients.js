'use strict';

module.exports = (sequelize, DataType) => {
    let eventRecipient = sequelize.define("event_recipients", {
        event_id: {
            type: DataType.INTEGER
        },
        contact_id: {
            type: DataType.INTEGER
        },
        fixed: {
            type: DataType.BOOLEAN,
            defaultValue: false
        },
        email: {
            type: DataType.STRING(191)
        },

        status: {
            type: DataType.ENUM,
            values: ['accepted', 'rejected', 'pending'],
            defaultValue: "pending"
        },
        date: {
            type: DataType.DATE
        },
        key: {
            type: DataType.TEXT
        },
        message: {
            type: DataType.TEXT
        }
    }, { underscored: true });

    eventRecipient.associate = function (models) {
        this.belongsTo(models.contacts, { 
            foreignKey: 'contact_id', 
            targetKey: 'id', 
            as: "contact" 
        });
        this.belongsTo(models.events, { 
            foreignKey: 'event_id', 
            targetKey: 'id', 
            as: "event" 
        });
    }

    return eventRecipient;
};