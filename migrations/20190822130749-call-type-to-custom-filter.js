module.exports = {
    up  : function (queryInterface, Sequelize) {
      return queryInterface
        .changeColumn("custom_filters", 'type', {
          type: Sequelize.ENUM('LEAD','CLIENT','SUPPLIER','CALL'),
          allowNull : false,
          defaultValue :'LEAD',
        });
    },
    down: function (queryInterface, Sequelize) {
      return queryInterface
        .changeColumn('custom_filters', 'type', {
          type: Sequelize.ENUM('1','2','3'),
          allowNull: false
        });
    }
  };