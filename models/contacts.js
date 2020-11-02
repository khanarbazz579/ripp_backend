'use strict';

module.exports = (sequelize, DataTypes) => {
    var contact = sequelize.define('contacts', {
        first_name: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        last_name: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        email: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        phone_number: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        profile_image: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        entity_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        entity_type: {
            type: DataTypes.ENUM,
            allowNull: false,
            defaultValue: 'LEAD_CLIENT',
            values: ['LEAD_CLIENT', 'SUPPLIER'],
            comment: 'LEAD_CLIENT : belongs to lead_client, SUPPLIER : belongs to supplier'
        },
        priority_order: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        is_primary: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
            underscored: true,
            getterMethods: {
                fullName() {
                    let firstName = this.getDataValue('first_name');
                    let lastName = this.getDataValue('last_name');

                    return firstName + " " + lastName;
                }
            },
        });

    contact.associate = function (models) {
        this.belongsTo(models.leads_clients, {
            foreignKey: 'entity_id',
            targetKey: 'id',
            as: "lead_client"
        });
        this.belongsTo(models.suppliers, {
            foreignKey: 'entity_id',
            targetKey: 'id',
            as: "suppliers"
        });
        this.hasMany(models.contact_details, {
            foreignKey: 'contact_id',
            targetKey: 'id',
            as: "contact_details",
            onDelete: "CASCADE"
        });
        this.hasMany(models.tasks, {
            foreignKey: "contact_id",
            targetKey: 'id',
            as: "tasks"
        });
        this.hasMany(models.event_recipients, {
            foreignKey: "contact_id",
            targetKey: 'id',
            as: "event_recipients"
        });
        this.hasMany(models.todo_contacts, {
            foreignKey: 'contact_id',
            targetKey: 'id',
            as: "todo_contacts"
        });
        /*  relation defined for for email list module */
        this.hasMany(models.subscribers, {
            foreignKey: 'subscriber_id',
            targetKey: 'id',
            as: 'subscribers',
            onDelete: "cascade"
        });
    };

    return contact;
};
