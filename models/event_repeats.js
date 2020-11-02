/**
 * Created by cis on 22/03/19.
 */
module.exports = (sequelize, DataType) => {
    let Model = sequelize.define("event_repeats", {
        repeat_type: {
            type: DataType.STRING(191),
            allowNull: true
        },
        repeat_type: {
            type: DataType.ENUM,
            values: ['none', 'every_day', 'every_week', 'every_month', 'every_year', 'custom']
        },
        custom_type: {
            type: DataType.ENUM,
            values: ['daily', 'weekly', 'monthly', 'yearly']
        },
        every: {
            type: DataType.INTEGER,
            allowNull: true
        },
        type: {
            type: DataType.ENUM,
            values: ['each', 'on']
        },
        event_repeat_day: {
            type: DataType.STRING(500)
        },
        day_type: {
            type: DataType.STRING(191)
        },
        on_day: {
            type: DataType.STRING(191)
        },
        end_repeat: {
            type: DataType.STRING(191)
        },
        end_repeat_on_date: {
            type: DataType.DATE
        },
        end_repeat_on_hours: {
            type: DataType.INTEGER
        },
        event_id: {
            type: DataType.INTEGER,
            allowNull: false
        },
        repeat_for: {
            type: DataType.ENUM,
            values: ['todo', 'event']
        },
        end_repeat_status: {
            type: DataType.INTEGER,
            defaultValue: 0
        },
    }, { underscored: true });

    return Model;
};
