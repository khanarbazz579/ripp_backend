'use strict';

module.exports = (sequelize, DataType) => {
    var todo = sequelize.define("todos", {
        name: {
            type: DataType.STRING(191),
            allowNull: false
        },
        category_id : {
            type :DataType.INTEGER,
            allowNull : true
        },
        start: {
            type: DataType.DATE
        },
        end: {
            type: DataType.DATE
        },
        is_all_day : {
            type :DataType.BOOLEAN,
            defaultValue : false
        },
        is_priority : {
            type :DataType.BOOLEAN,
            defaultValue : false
        },
        is_complete : {
            type :DataType.BOOLEAN,
            defaultValue : false
        },
        notes : {
            type : DataType.STRING(191),
            allowNull: true
        },
        remind_me : {
            type : DataType.STRING(191),
            allowNull: true
        },
        user_id : {
            type :DataType.INTEGER,
            allowNull : true
        },
        completed_date : {
            type :DataType.DATE,
            allowNull : true
        },
        parent : {
            type :DataType.INTEGER,
            defaultValue : 0
        },
        is_deleted : {
            type :DataType.BOOLEAN,
            defaultValue : false
        }
    },{underscored: true});

    todo.associate = function (models) {
        this.hasMany(models.todo_contacts, {
            foreignKey: 'todo_id',
            targetKey: 'id',
            as: 'contacts'
        });
        this.belongsbTo(models.categories, {
            foreignKey: 'category_id',
            targetKey: 'id',
            as: 'category'
        });
        this.belongsTo(models.users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: 'user'
        });
         this.hasMany(models.event_repeats, {
            foreignKey: 'event_id',
            targetKey: 'id',
            as: 'event_repeats'
        });
    };

    return todo;
};
