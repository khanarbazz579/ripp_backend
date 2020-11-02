'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		let currentDate = new Date();
		await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
		await queryInterface.sequelize.query('TRUNCATE TABLE global_notification_settings');

		return await queryInterface.bulkInsert('global_notification_settings', [{
			type: "CALL",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "TODO",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "EVENT",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "EVENT_ACCEPT",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "EVENT_REJECT",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "EVENT_MAY_BE",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "EMAIL",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "LEAD",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "CLIENT",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "SUPPLIER",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}, {
			type: "USER_MEDIA",
			is_active: 1,
			created_at: currentDate,
			updated_at: currentDate
		}
		], {})
			.then(() => {
				return queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
			});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('global_notification_settings', null, {});
	}
};
