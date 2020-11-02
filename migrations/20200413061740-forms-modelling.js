'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('forms', 'status', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }),
      queryInterface.addColumn('forms', 'type', "VARCHAR(30)"),
      queryInterface.addColumn('forms', 'sales_stage_id', Sequelize.INTEGER),
      queryInterface.addColumn('forms', 'user_type', "VARCHAR(16)"),
      queryInterface.addColumn('forms', 'verified', Sequelize.BOOLEAN),
      queryInterface.addColumn('forms', 'fields_mapped', Sequelize.BOOLEAN),
      queryInterface.addColumn('forms', 'field_mapping_buffer', Sequelize.JSON),
      queryInterface.removeColumn('forms', 'analytic_app_id'),
      queryInterface.removeColumn('forms', 'form_fields')
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('forms', 'analytic_app_id', Sequelize.INTEGER),
      queryInterface.addColumn('forms', 'form_fields', Sequelize.JSON),
      queryInterface.removeColumn('forms', 'status'),
      queryInterface.removeColumn('forms', 'user_type'),
      queryInterface.removeColumn('forms', 'sales_stage_id'),
      queryInterface.removeColumn('forms', 'fields_mapped'),
      queryInterface.removeColumn('forms', 'field_mapping_buffer'),
      queryInterface.removeColumn('forms', 'type'),
      queryInterface.removeColumn('forms', 'verified')
    ]);
  }
};
