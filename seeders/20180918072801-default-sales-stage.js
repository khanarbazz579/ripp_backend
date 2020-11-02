'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let currentDate = new Date();
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryInterface.sequelize.query('TRUNCATE TABLE events');
    await queryInterface.sequelize.query('TRUNCATE TABLE leads_clients');
    await queryInterface.sequelize.query('TRUNCATE TABLE sales_stages');
    await queryInterface.sequelize.query('TRUNCATE TABLE stage_check_statuses');

      return await queryInterface.bulkInsert('sales_stages', [{
        name: 'Unqualified Leads',
        description: 'Still to Contact',
        default_id : 1,
        close_probability : 0,
        priority_order : 7,
        is_pipeline: false,
        for: 'LEAD',
        created_at : currentDate,
        updated_at : currentDate
      },{
        name: 'Quotation / Proposal',
        description: 'Issued Quote',
        default_id : 2,
        close_probability : 50,
        priority_order : 1,
        is_pipeline: true,
        created_at : currentDate,
        updated_at : currentDate
      },{
        name: 'Negotiation',
        description: 'Closing the Sale',
        default_id : 3,
        close_probability : 60,
        priority_order : 2,
        is_pipeline: true,
        created_at : currentDate,
        updated_at : currentDate
      },{
        name: 'Confirmation',
        description: 'Invoice Issued',
        default_id : 4,
        close_probability : 95,
        priority_order : 3,
        is_pipeline: true,
        created_at : currentDate,
        updated_at : currentDate
      },{
        name: 'Paid',
        description: 'Funds Received',
        default_id : 5,
        close_probability : 100,
        
        priority_order : 4,
        is_pipeline: true,
        created_at : currentDate,
        updated_at : currentDate
      },
      {
        name: 'Need Analysis',
        description: 'Initial Discussions',
        default_id : 6,
        close_probability : 25,
        priority_order : 5,
        is_pipeline: true,
        created_at : currentDate,
        updated_at : currentDate
      },
      {
        name: 'Lost Leads',
        description: 'Lost Sale',
        default_id : 7,
        close_probability : 0,
        priority_order : 8,
        is_pipeline: false,
        for: 'LEAD',
        created_at : currentDate,
        updated_at : currentDate
      },
      {
        name: 'Qualified Leads',
        description: 'Qualified Leads',
        default_id : 8,
        close_probability : 100,
        priority_order : 0,
        is_pipeline: false,
        for: 'LEAD',
        created_at : currentDate,
        updated_at : currentDate
      },{
        name: 'Active',
        for: 'SUPPLIER',
        default_id: 9,
        close_probability: 0,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        name: 'Dormant',
        for: 'SUPPLIER',
        default_id: 10,
        close_probability: 0,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        name: 'Active',
        for: 'CLIENT',
        default_id: 11,
        close_probability: 0,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        name: 'Lost',
        for: 'CLIENT',
        default_id: 12,
        close_probability: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
     ], {})
      .then(() => {
        return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('sales_stages', null, {});
  }
};
