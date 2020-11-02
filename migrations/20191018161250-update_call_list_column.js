'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        
        .then(() => { 
            return queryInterface
            .changeColumn("call_lists", 'sechdule_date', {
                "type": "DATETIME",
                allowNull : true
              });  
        })
        
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(() => {
            return queryInterface
            .changeColumn("call_lists", 'sechdule_date', {
                "type": "DATETIME",
                allowNull : false
              });  
        })
        .then(() => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        });
    }
};