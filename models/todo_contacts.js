'use strict';

module.exports = (sequelize, DataType) => {
    var todoContacts = sequelize.define("todo_contacts", {
        todo_id : {
            type :DataType.INTEGER,
            allowNull : true
        },
        contact_id : {
            type :DataType.INTEGER,
            allowNull : true
        },
    },{underscored: true});

    todoContacts.associate = function (models) {
        this.belongsTo(models.todos, {
            foreignKey: 'todo_id',
            targetKey: 'id',
            as: "todo"
        });
        this.belongsTo(models.contacts, {
            foreignKey: 'contact_id',
            targetKey: 'id',
            as: "contacts"
        });
    };

    return todoContacts;
};
