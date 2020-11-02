module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                'event_recipients',
                'message',
                {
                    type: Sequelize.STRING
                }
            ),
            queryInterface.addColumn(
                'event_recipients',
                'date',
                {
                    type: Sequelize.DATE
                }
            ),
            queryInterface.addColumn(
                'event_recipients',
                'key',
                {
                    type: Sequelize.TEXT
                }
            )

        ]);
    }
}