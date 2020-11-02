module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn(
                'invite_events',
                'status', {
                    type: Sequelize.ENUM('U', 'Y', 'N', 'T'),
                    defaultValue: "U",
                    values: [
                        "U",
                        "Y",
                        "N",
                        "T"
                    ]
                }
            )
        ]);
    }
}