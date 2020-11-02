'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface
            .changeColumn(
                'notifications',
                'type', {
                    type: Sequelize.ENUM(
                        "CALL",
                        "EVENT",
                        "EVENT_ACCEPT",
                        "EVENT_REJECT",
                        "EVENT_MAY_BE",
                        "TODO",
                        "EMAIL"
                    ),
                });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface
            .changeColumn(
                'notifications',
                'type', {
                    type: Sequelize.ENUM(
                        "CALL",
                        "EVENT",
                        "EVENT_ACCEPT",
                        "EVENT_REJECT",
                        "EVENT_MAY_BE",
                        "TODO",
                    ),
                });
    }
};