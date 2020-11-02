'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.createTable('emails', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                parent_id: {
                    allowNull: true,
                    type: "VARCHAR(250)"
                },
                subject: {
                    allowNull: true,
                    type: Sequelize.TEXT
                },
                conversation_id: {
                    allowNull: true,
                    type: Sequelize.TEXT
                },
                email_online_id: {
                    allowNull: true,
                    type: Sequelize.TEXT
                },
                lead_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER
                },
                user_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER
                },
                provider: {
                    allowNull: true,
                    type: "VARCHAR(250)"
                },
                email_user: {
                    allowNull: true,
                    type: "VARCHAR(250)"
                },

                tracking_code: {
                    allowNull: true,
                    type: "VARCHAR(250)"
                },

                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            }),

            queryInterface.createTable('email_user_details', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                user_id: {
                    allowNull: true,
                    type: Sequelize.INTEGER
                },
                user_email: {
                    allowNull: true,
                    type: "VARCHAR(250)"
                },
                email_id: {
                    allowNull: true,
                    type: Sequelize.INTEGER
                },
                tracking_code: {
                    allowNull: false,
                    type: "VARCHAR(250)"
                },
                user_type: {
                    allowNull: true,
                    type: "VARCHAR(60)"
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            }),

            queryInterface.createTable('email_tracking_details', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                mail_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER
                },
                tracking_code: {
                    allowNull: false,
                    type: "VARCHAR(60)"
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE
                }
            })

        ])
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.dropTable('emails'),
            queryInterface.dropTable('email_user_details'),
            queryInterface.dropTable('email_tracking_details')
        ]);
    }
};