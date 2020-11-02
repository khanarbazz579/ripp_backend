'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
	   // await queryInterface.sequelize.query('TRUNCATE TABLE files_folders_accesses');
	   // await queryInterface.sequelize.query('TRUNCATE TABLE files_folders');
        
        let currentDate = new Date();

        let files_folder_id = [];

        await queryInterface.bulkInsert('files_folders', [
            {
                original_name: 'alex.ripplecrm@gmail.com',
                created_by: 1,
                entity_type: 'FOLDER',
                created_at: currentDate,
                updated_at: currentDate
            }
        ], {})
            .then((id)=>{
                files_folder_id[0] = id;
        });

        // simon@pswebsitedesign.com
        await queryInterface.bulkInsert('files_folders', [
            {
                original_name: 'simon@pswebsitedesign.com',
                created_by: 2,
                entity_type: 'FOLDER',
                created_at: currentDate,
                updated_at: currentDate
            }
        ], {})
            .then((id)=>{
                files_folder_id[1] = id;
        });

        // gaurav@mailinator.com
        await queryInterface.bulkInsert('files_folders', [
            {
                original_name: 'gaurav@mailinator.com',
                created_by: 3,
                entity_type: 'FOLDER',
                created_at: currentDate,
                updated_at: currentDate
            }
        ], {})
            .then((id)=>{
                files_folder_id[2] = id;
        });

        // ripple.cis2018@gmail.com
        await queryInterface.bulkInsert('files_folders', [
            {
                original_name: 'ripple.cis2018@gmail.com',
                created_by: 4,
                entity_type: 'FOLDER',
                created_at: currentDate,
                updated_at: currentDate
            }
        ], {})
            .then((id)=>{
                files_folder_id[3] = id;
        });
 
        return await queryInterface.bulkInsert('files_folders_accesses', [{
                name: 'My Files',
                file_folder_id: files_folder_id[0],
                user_id: 1,
                permission: 'EDIT',
                entity_type: 'FOLDER',
                parent_id: null,
                refrence_id: null,
                master_name: 'alex.ripplecrm@gmail.com',
                count:0,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'My Files',
                file_folder_id: files_folder_id[1],
                user_id: 2,
                permission: 'EDIT',
                entity_type: 'FOLDER',
                parent_id: null,
                refrence_id: null,
                master_name: 'simon@pswebsitedesign.com',
                count:0,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'My Files',
                file_folder_id: files_folder_id[2],
                user_id: 3,
                permission: 'EDIT',
                entity_type: 'FOLDER',
                parent_id: null,
                refrence_id: null,
                master_name: 'gaurav@mailinator.com',
                count:0,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'My Files',
                file_folder_id: files_folder_id[3],
                user_id: 4,
                permission: 'EDIT',
                entity_type: 'FOLDER',
                parent_id: null,
                refrence_id: null,
                master_name: 'ripple.cis2018@gmail.com',
                count:0,
                created_at: currentDate,
                updated_at: currentDate
            }
        ]).then(_=>{
            queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        })
    },

    down: (queryInterface, Sequelize) => {  
        return queryInterface.bulkDelete('files_folders_accesses', null, {});
    }
};