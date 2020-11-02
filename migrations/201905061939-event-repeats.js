module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                'event_repeats',
                'repeat_for', {
                    "type": "ENUM('todo','event')",
                    "values": [
                        'todo', 'event'
                    ]
                }
            )
        ]);
    }
}