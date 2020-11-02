'use strict';
const bcrypt = require('bcrypt');
const tables = [
  'analytic_apps',
  'analytic_app_users',
  'analytics_app_activities'
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    tables.map(async table => await queryInterface.sequelize.query(`TRUNCATE TABLE ${table}`));

    let usersQuery = `SELECT U.id,U.first_name,U.email FROM users as U LEFT JOIN user_roles as UR on U.role_id = UR.id WHERE UR.name = 'Admin' LIMIT 1`;

    // Create an application
    let user = await queryInterface.sequelize.query(usersQuery, { 
      type: queryInterface.sequelize.QueryTypes.SELECT 
    });

    if(user.length) {
      const salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(Date.now() + user[0].email, salt);

      let inserted = await queryInterface.bulkInsert('analytic_apps', [{
        user_id: user[0].id,
        url: 'https://frontend.devsubdomain.com',
        app_id: hash,
        created_at: new Date(),
        updated_at: new Date()
      }]);

    }
  },
  down: (queryInterface, Sequelize) => {
    tables.map(async table => await queryInterface.sequelize.query(`TRUNCATE TABLE ${table}`));
  }
};
