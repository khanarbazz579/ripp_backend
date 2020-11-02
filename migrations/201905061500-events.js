module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn(
                'events',
                'is_end', {
                    type: Sequelize.BOOLEAN
                }
            ),
            queryInterface.addColumn(
                'events',
                'is_end_time', {
                    type: Sequelize.BOOLEAN
                }
            )
        ]);
    }
}