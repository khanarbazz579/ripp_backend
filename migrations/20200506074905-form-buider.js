'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('forms', 'form_name', {
        type: Sequelize.STRING(191),
        allowNull: false
      }),
      // queryInterface.renameColumn('form_submissions', 'createdAt', 'created_at'),
      // queryInterface.renameColumn('form_submissions', 'updatedAt', 'updated_at'),
      queryInterface.addColumn('sales_stages', 'for', {
        type: Sequelize.ENUM,
        values: ['CLIENT', 'LEAD', 'SUPPLIER'],
        allowNull: true
      })
    ])
    .then(() => {
      return queryInterface.sequelize.query("UPDATE sales_stages SET `for` = 'LEAD' WHERE name IN ('Unqualified Leads', 'Lost Leads', 'Qualified Leads')")
    })
    .then(() => {
      queryInterface.bulkInsert('sales_stages', [{
        name: 'Active',
        for: 'SUPPLIER',
        default_id: 9,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        name: 'Dormant',
        for: 'SUPPLIER',
        default_id: 10,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        name: 'Active',
        for: 'CLIENT',
        default_id: 11,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        name: 'Lost',
        for: 'CLIENT',
        default_id: 12,
        created_at: new Date(),
        updated_at: new Date()
      }])
    })
  },

  down: (queryInterface, Sequelize) => {
   return Promise.all([
      queryInterface.changeColumn('forms', 'form_name', {
        type: Sequelize.STRING(60),
        allowNull: false
      }),
      // queryInterface.renameColumn('form_submissions', 'created_at', 'createdAt'),
      // queryInterface.renameColumn('form_submissions', 'updated_at', 'updatedAt'),
      queryInterface.removeColumn('sales_stages', 'for')
    ]);
  }
};
