'use strict';

module.exports = (sequelize, DataTypes) => {
    var meetingRoom = sequelize.define('meeting_rooms', {
        user_id: {
            type: DataTypes.INTEGER
        },
        title: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
    }, {
        underscored: true
    });

    meetingRoom.associate = function (models) {
        this.belongsTo(models.users, {
            foreignKey: 'user_id',
            targetKey: 'id',
            as: "user"
        });
    };

    return meetingRoom;
};