'use strict';

module.exports = (sequelize, DataTypes) => {
    var customField = sequelize.define('custom_fields', {
        type: {
            allowNull: false,
            type: DataTypes.ENUM('LEAD', 'CLIENT', 'BOTH', 'NONE'),
            defaultValue: 'LEAD'
        },
        table_name: {
            type : DataTypes.ENUM,
            allowNull : true,
            values : [
                'leads_clients', 
                'users', 
                'companies', 
                'contacts',
                'lead_client_details', 
                'user_details', 
                'company_details', 
                'contact_details',
                'call_details', 
                'supplier_details'
            ],
        },
        model_name: {
            type : DataTypes.ENUM,
            allowNull : true,
            values : [
                'first_name', 
                'last_name', 
                'email', 
                'phone_number',
                'profile_image',
                'name',
                'birth_date',
                'password',
                'landline',
                'sales_stage_id',
                'job_title'
            ],
        },
        label: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        placeholder: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        help_text: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        control_type: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        additional_attribute: {
            allowNull: true,
            type: DataTypes.STRING(191)
        },
        section_id: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        priority_order: {
            type: DataTypes.INTEGER,
            defaultValue : 0
        },
        client_priority_order: {
            type: DataTypes.INTEGER,
            defaultValue : 0
        },
        restrict_action: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defualtValue: 0
        },
        field_size: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defualtValue: 12
        },
        is_required: {
            allowNull: true,
            type: DataTypes.BOOLEAN,
            defualtValue: false
        },
        is_hidden: {
            allowNull: true,
            type: DataTypes.BOOLEAN,
            defualtValue: false
        },
        is_default: {
            allowNull: true,
            type: DataTypes.BOOLEAN,
            defualtValue: false
        }
    } ,{ 
        underscored: true 
    });

    customField.associate = function(models){
        this.hasOne(models.form_default_fields , { 
            foreignKey: "field_id"
        });
        this.belongsTo(models.sections);
        this.hasOne(models.permission, {
            foreignKey: 'custom_field_id',
            onDelete:'cascade'
        })
    };

    return customField;
}; 