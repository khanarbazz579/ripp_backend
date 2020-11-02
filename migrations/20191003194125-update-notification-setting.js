'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface
            .changeColumn(
                'global_notification_settings',
                'type', {
                    type: Sequelize.ENUM(
                        "CALL",
                        "EVENT",
                        "EVENT_ACCEPT",
                        "EVENT_REJECT",
                        "EVENT_MAY_BE",
                        "TODO",
                        "EMAIL",
                        "LEAD",
                        "CLIENT",
                        "SUPPLIER",
                        "USER_MEDIA",
                    ),
                });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface
            .changeColumn(
                'global_notification_settings',
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
    }
};