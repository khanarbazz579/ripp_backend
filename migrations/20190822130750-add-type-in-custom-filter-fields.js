module.exports = {
    up  : function (queryInterface, Sequelize) {
      return queryInterface
        .addColumn("custom_filter_fields", 'type', {
          type: Sequelize.ENUM('LEAD','CLIENT','SUPPLIER'),
          allowNull : false,
          defaultValue :'LEAD',
        });
    },
    down: function (queryInterface, Sequelize) {
      return queryInterface
        .removeColumn('custom_filter_fields', 'type', {
          type: Sequelize.ENUM('1','2','3'),
          allowNull: false
        });
    }
  };