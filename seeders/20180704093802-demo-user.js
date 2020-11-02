'use strict';
const { ROLES, SETS } = require('../constants/permissions');

module.exports = {
    up: async(queryInterface, Sequelize) => {

        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        await queryInterface.sequelize.query('TRUNCATE TABLE user_roles');
        await queryInterface.sequelize.query('TRUNCATE TABLE permission_sets');
        await queryInterface.sequelize.query('TRUNCATE TABLE accounts');
        await queryInterface.sequelize.query('TRUNCATE TABLE users');

        let currentDate = new Date();

        let roleId = 1,
            permissionSetId, accountId, adminRole;

        await queryInterface.bulkInsert('user_roles', [{
                name: ROLES.ADMIN,
                parent_id: null,
                created_by: null,
                created_at: currentDate,
                updated_at: currentDate
            }], {})
            .then((admin_role) => {
                adminRole = admin_role
                return queryInterface.bulkInsert('user_roles', [{
                    name: ROLES.DEFAULT,
                    parent_id: adminRole,
                    created_by: null,
                    created_at: currentDate,
                    updated_at: currentDate
                }], {});
            })
            .then((role_id) => {
                roleId = role_id;
            })

        await queryInterface.bulkInsert('permission_sets', [{
                name: SETS.DEFAULT,
                created_by: 1,
                created_at: currentDate,
                updated_at: currentDate
            }], {})
            .then((permission_id) => {
                permissionSetId = permission_id;
            })

        await queryInterface.bulkInsert('accounts', [{
                name: "Ripple CRM",
                created_at: currentDate,
                updated_at: currentDate
            }], {})
            .then((account_id) => {
                accountId = account_id;
            })

        return await queryInterface.bulkInsert('users', [{
                first_name: 'Alex',
                last_name: 'Brooke',
                email: 'alex.ripplecrm@gmail.com',
                password: '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa',
                role_id: adminRole,
                permission_set_id: permissionSetId,
                account_id: accountId,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                first_name: 'Simon',
                last_name: 'Middleton',
                email: 'simon@pswebsitedesign.com',
                password: '$2a$04$2Zzohr1Mp0zPbzi8Cg0FWOq6QbmjPpxocJFxympyKKBHQWhgki7i.',
                role_id: adminRole,
                permission_set_id: permissionSetId,
                account_id: accountId,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                first_name: 'Gaurav',
                last_name: 'Vaidya',
                email: 'gaurav.pwd@cisinlabs.com',
                password: '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa',
                role_id: roleId,
                permission_set_id: permissionSetId,
                account_id: accountId,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                first_name: 'Ripple',
                last_name: 'CIS',
                email: 'ripple.cis2018@gmail.com',
                password: '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa',
                role_id: roleId,
                permission_set_id: permissionSetId,
                account_id: accountId,
                created_at: currentDate,
                updated_at: currentDate
            }
        ]).then(_ => {
            return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        })
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', null, {});
    }
};

/* 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
'1', 'Alex', 'Brooke', 'alex.ripplecrm@gmail.com', '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa', '2018-10-11 00:00:00', '55543346546456', '3433939546546546', '2_1535814506792.jpg', '0', '2018-08-17 00:00:00', '2018-09-17 16:16:01', '1'
'2', 'Simon', 'Middleton', 'simon@pswebsitedesign.com', '$2a$04$2Zzohr1Mp0zPbzi8Cg0FWOq6QbmjPpxocJFxympyKKBHQWhgki7i.', '2018-08-17 00:00:00', '', '', '3_1535963165072.jpg', '0', '2018-08-17 00:00:00', '2018-09-03 08:26:05', '1'
'3', 'Gaurav', 'Vaidya', 'test@mailinator.com', '$2b$10$qb94MetM5Qv963r/uuqZoOTe3auCyzOQ9NAmJn75scOBThlxeMtZW', NULL, '', '', '9_1535126758180.jpg', '0', '2018-08-17 00:00:00', '2018-08-24 16:06:00', '0'
'4', 'Ripple', 'CIS', 'ripple.cis2018@gmail.com', '$2b$10$QmehDcZoXyHoPPLc7XeBcePmPwmzNih6cPKfL4XVtG7XQqE.SOrwG', '2018-08-17 00:00:00', '', '', '', '0', '2018-08-17 00:00:00', '2018-08-17 00:00:00', '0'
 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 */