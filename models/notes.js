'use strict';

module.exports = (sequelize, DataTypes) => {
    var note = sequelize.define('notes', {
        note: {
            allowNull: false,
            type: DataTypes.TEXT
        },
        entity_type: {
            type: DataTypes.ENUM,
            allowNull: false,
            defaultValue: 'CONTACT',
            values: [ 'CONTACT', 'LEAD_CLIENT', 'SUPPLIER'],
            comment: 'LEAD_CLIENT : belongs to lead_client, SUPPLIER : belongs to supplier'
        },
        entity_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        }
    }, { 
        underscored: true 
    });

    return note;
};