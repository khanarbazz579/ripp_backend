const Country = require('../models').countries;
const Currency = require('../models').currencies;
const User = require('../models').users;
const SaleStage = require('../models').sales_stages;
const Sequelize = User.sequelize;
const Section = require('../models').sections;
const CustomField = require('../models').custom_fields;
const Permission = require('../models').permission

const fieldsWithAttribute = async function (sections) {
    let err, countryList, saleStageList = [], userList = [], currencyList = [];

    [err, currencyList] = await to(
        Currency.findAll({
            attributes: [
                ['symbol', 'value'],
                ['id', 'key']
            ]
        })
    );

    [err, countryList] = await to(
        Country.findAll({
            attributes: [
                ['name', 'value'],
                ['id', 'key']
            ]
        })
    );

    [err, saleStageList] = await to(
        SaleStage.findAll({
            where: {
                is_pipeline: false
            },
            attributes: [
                ['name', 'value'],
                ['id', 'key']
            ],
            order: [
                ['priority_order', 'ASC']
            ]
        })
    );

    [err, userList] = await to(
        User.findAll({
            where: {
                is_deleted: 0
            },
            attributes: [
                [Sequelize.fn("concat", Sequelize.col("first_name"), ' ', Sequelize.col("last_name")), 'value'],
                ['id', 'key']
            ]
        })
    );

    const createDropdownAttribute = (field) => {
        switch (field.control_type) {
            case "currency":
                field.additional_attribute = currencyList;
                break;
            case "country_dropdown":
                field.additional_attribute = countryList;
                break;
            case "lead_owner":
                field.additional_attribute = userList;
                break;
            case "sales_stage":
                field.additional_attribute = saleStageList;
                break;
        };

        return field;
    };

    sections.forEach(section => {
        section.custom_fields.forEach(custom_field => {
            if ((custom_field.control_type == "dropdown" || custom_field.control_type == "radio" || custom_field.control_type == "checkbox") && custom_field.additional_attribute) {
                custom_field.additional_attribute = Object.values(JSON.parse(custom_field.additional_attribute));
            } else {
                custom_field = createDropdownAttribute(custom_field);
            };
        });
    });

    return [err, sections];
};

module.exports = fieldsWithAttribute;

const getCustomFieldsOfType = async function (sectionType){
    const sectionInfo = {
        "lead": {
            $or: ['LEAD_CLIENT', 'LEAD_CLIENT_COMPANY', 'LEAD_CLIENT_CONTACT']
        },
        "client": {
            $or: ['LEAD_CLIENT', 'LEAD_CLIENT_COMPANY', 'LEAD_CLIENT_CONTACT']
        },
        "both": {
            $or: ['LEAD_CLIENT', 'LEAD_CLIENT_COMPANY', 'LEAD_CLIENT_CONTACT']
        },
        "supplier": "SUPPLIER",
        "user": "USER"
    };

    const fieldInfo = {
        "lead": {
            $or: ['LEAD', 'BOTH']
        },
        "client": {
            $or: ['CLIENT', 'BOTH']
        },
        "both": {
            $or: ['LEAD', 'CLIENT', 'BOTH']
        },
        "supplier": "SUPPLIER",
        "user": "USER"
    };

    let custom_field_priority = 'custom_fields.priority_order';
    let section_priority = 'sections.priority_order';
    if(sectionType == "client"){
        section_priority = 'sections.client_priority_order';
        custom_field_priority = 'custom_fields.client_priority_order';
    }
    

    const [err0, sections] = await to(
        Section.findAll({
            where: {
                type: sectionInfo[sectionType],
            },
            include: [{
                model: CustomField,
                as: "custom_fields",
                where: {
                    type : fieldInfo[sectionType]
                },
                required: false,
                include: [{
                    model: Permission,
                    attributes: ['permission', 'parent_id', 'id']
                }]
            }, {
                model: Permission,
                attributes: ['permission', 'parent_id', 'id']
            }],
            order: [
                [ Sequelize.col(section_priority), 'ASC'],
                [ Sequelize.col(custom_field_priority), 'ASC']
            ]

        }).map(el => el.get({
            plain: true
        }))
    );

    if (err0) {
        return [err0, null];
    };

    const [err, fields] = await fieldsWithAttribute(sections);

    return [err, fields];

};

module.exports.getCustomFieldsOfType = getCustomFieldsOfType;

 