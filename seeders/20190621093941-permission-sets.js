'use strict';
const currentDate = new Date();
const { ROLES, SETS } = require('../constants/permissions');

const Users = [{
  first_name: 'Ripple',
  last_name: 'Admin',
  email: 'gourav.pwd@cisinlabs.com',
  password: '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa',
  created_at: currentDate,
  updated_at: currentDate,
  role: ROLES.ADMIN
}, {
  first_name: 'Ripple',
  last_name: 'Executive',
  email: 'arbaz.k@cisinlabs.com',
  password: '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa',
  created_at: currentDate,
  updated_at: currentDate,
  role: ROLES.DEFAULT,
  permissionSet: {
    name: SETS.EXECUTIVE,
    description: 'Default permission set for executive.',
    created_by: null
  }
}];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await queryInterface.sequelize.query("TRUNCATE TABLE permission_sets");
    await queryInterface.sequelize.query("TRUNCATE TABLE user_has_permission_sets");

    let adminRole = await queryInterface.sequelize.query(`SELECT id FROM user_roles WHERE name = '${ROLES.ADMIN}'`, { type: queryInterface.sequelize.QueryTypes.SELECT })
    if(adminRole.length) {
      adminRole = adminRole[0].id
    } else {
      adminRole = 2;
    }

    for (let i = 0; i < Users.length; i++) {
      let user = await queryInterface.bulkInsert('users', [{
        first_name: Users[i].first_name,
        last_name: Users[i].last_name,
        email: Users[i].email,
        password: Users[i].password,
        created_at: Users[i].created_at,
        updated_at: Users[i].updated_at,
        role_id: Users[i].role === ROLES.ADMIN ? adminRole : 1,
        permission_set_id: 1
      }]);

      if (Users[i].permissionSet) {
        let permission_set = await queryInterface.bulkInsert('permission_sets', [{
          ...Users[i].permissionSet,
          created_by: user,
          created_at: currentDate,
          updated_at: currentDate
        }]);

        await queryInterface.bulkInsert('user_has_permission_sets', [{
          user_id: user,
          permission_set_id: permission_set,
          created_at: currentDate,
          updated_at: currentDate
        }]);
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("TRUNCATE TABLE permission_sets");
  }
};
