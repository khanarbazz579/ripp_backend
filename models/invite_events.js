/**
 * Created by cis on 30/03/19.
 */
module.exports = (sequelize, DataType) => {
    let Model = sequelize.define("invite_events", {
        event_id: {
            type: DataType.INTEGER,
            allowNull: false
        },
        event_recipients_id: {
            type: DataType.INTEGER,
            allowNull: false
        },
        key: {
            type: DataType.STRING(500)
        },
        status: {
            type: DataType.ENUM,
            values: ['U', 'Y', 'N', 'T']
        },
        message: {
            type: DataType.STRING(500)
        },
        reminder_date: {
            type: DataType.DATE,
            allowNull: false
        }
    }, { underscored: true });

    return Model;
};