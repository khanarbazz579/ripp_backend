'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {

        let sectionId;
        let currentDate = new Date();

        await queryInterface.bulkInsert('sections', [
            {
                name: "Personal Information",
                description: "Default Profile Section 1",
                type: "USER",
                priority_order: 0,
                restrict_action: '4',
                allow_add_fields: false,
                is_hidden: false,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                name: "Change Your Password",
                description: "Default Profile Section 2",
                type: "USER",
                priority_order: 1,
                restrict_action: '4',
                allow_add_fields: false,
                is_hidden: false,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                name: "Contact Information",
                description: "Default Profile Section 3",
                type: "USER",
                priority_order: 2,
                restrict_action: '4',
                allow_add_fields: false,
                is_hidden: false,
                created_at: currentDate,
                updated_at: currentDate,
            }
        ], {})
            .then((section_id) => {
                sectionId = section_id;
            })

        let fieldId;

        await queryInterface.bulkInsert('custom_fields', [
            {
                type: "USER",
                table_name: "users",
                model_name: "first_name",
                label: "First Name",
                placeholder: "Enter firstname here",
                help_text: "Enter firstname here",
                control_type: "textfield",
                additional_attribute: null,
                section_id: sectionId,
                priority_order: 0,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: "users",
                model_name: "last_name",
                label: "Last Name",
                placeholder: "Enter last name here",
                help_text: "Enter last name here",
                control_type: "textfield",
                additional_attribute: null,
                section_id: sectionId,
                priority_order: 1,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: "users",
                model_name: "job_title",
                label: "Job Title",
                placeholder: "Enter job title here",
                help_text: "Enter job title here",
                control_type: "textfield",
                additional_attribute: null,
                section_id: sectionId,
                priority_order: 2,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: "users",
                model_name: "birth_date",
                label: "Birthday",
                placeholder: "Enter your birth date",
                help_text: "Select your birth date",
                control_type: "date_picker",
                additional_attribute: null,
                section_id: sectionId,
                priority_order: 3,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: null,
                model_name: null,
                label: "Confirm Old Password",
                placeholder: "Enter your old password",
                help_text: "Enter your old password",
                control_type: "password",
                additional_attribute: null,
                section_id: ++sectionId,
                priority_order: 0,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: null,
                model_name: null,
                label: "Add New Password",
                placeholder: "Enter your new password",
                help_text: "Enter your new password",
                control_type: "password",
                additional_attribute: null,
                section_id: sectionId,
                priority_order: 1,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: "users",
                model_name: "password",
                label: "Confirm New Password",
                placeholder: "Enter your confirm new password",
                help_text: "Enter your confirm new password",
                control_type: "password",
                additional_attribute: null,
                section_id: sectionId,
                priority_order: 2,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: "users",
                model_name: "email",
                label: "Email",
                placeholder: "Enter your email here",
                help_text: "Enter your email here",
                control_type: "textfield",
                additional_attribute: null,
                section_id: ++sectionId,
                priority_order: 0,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: "users",
                model_name: "phone_number",
                label: "Mobile Number",
                placeholder: "Enter your mobile number here",
                help_text: "Enter your mobile number here",
                control_type: "textfield",
                additional_attribute: null,
                section_id: sectionId,
                priority_order: 1,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            },
            {
                type: "USER",
                table_name: "users",
                model_name: "landline",
                label: "Phone Number",
                placeholder: "Enter your phone number here",
                help_text: "Enter your phone number here",
                control_type: "textfield",
                additional_attribute: null,
                section_id: sectionId,
                priority_order: 2,
                restrict_action: '7',
                field_size: 12,
                is_required: false,
                is_hidden: false,
                is_default: true,
                created_at: currentDate,
                updated_at: currentDate,
            }
        ], {}).then((field_id) => {
            fieldId = field_id
        })

        return await queryInterface.bulkInsert('form_default_fields', [
            {
                name: 'First name',
                custom_field_id: fieldId,
                is_required: true,
                model_name: 'first_name',
                item_type: '0',
                priority_order: 0,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Last name',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'last_name',
                item_type: '0',
                priority_order: 1,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Job Title',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'job_title',
                item_type: '0',
                priority_order: 2,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Birthday',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'birth_date',
                item_type: '0',
                priority_order: 3,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Confirm Old Password',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'old_password',
                item_type: '0',
                priority_order: 4,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Add New Password',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'password',
                item_type: '0',
                priority_order: 5,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Confirm New Password',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'new_password',
                item_type: '0',
                priority_order: 6,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Email',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'email',
                item_type: '0',
                priority_order: 7,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Mobile',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'mobile',
                item_type: '0',
                priority_order: 8,
                created_at: currentDate,
                updated_at: currentDate
            },
            {
                name: 'Landline',
                custom_field_id: ++fieldId,
                is_required: true,
                model_name: 'landline',
                item_type: '0',
                priority_order: 9,
                created_at: currentDate,
                updated_at: currentDate
            }

        ], {});
    },

    down: (queryInterface, Sequelize) => {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.
 
          Example:
          return queryInterface.bulkDelete('Person', null, {});
        */
    }
};
