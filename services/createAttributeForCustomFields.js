'use strict';
const Country = require('../models').countries;
const User = require('../models').users;
const SaleStage = require('../models').sales_stages;
const Sequelize = User.sequelize;
const Section = require('../models').sections;
const CustomField = require('../models').custom_fields;

const fieldsWithAttribute = async function (custom_fields) {
    let err, countryList, saleStageList = [],
        userList = [];

    [err, countryList] = await to(
        Country.findAll({
            attributes: [
                ['name', 'value'],
                ['country_code', 'key']
            ],
            raw: true,
        })
    );


    [err, saleStageList] = await to(
        SaleStage.findAll({
            where: {
                is_pipeline: false
            },
            raw: true,
            attributes: [
                ['name', 'value'],
                ['id', 'key']
            ]
        })
    );

    [err, userList] = await to(
        User.findAll({
            where: {
                is_deleted: 0
            },
            raw: true,
            attributes: [
                [Sequelize.fn("concat", Sequelize.col("first_name"), ' ', Sequelize.col("last_name")), 'value'],
                ['id', 'key']
            ]
        })
    );



    const createDropdownAttribute = (field) => {
        switch (field.control_type) {
            case "currency":
                field.additional_attribute = '';
                break;
            case "country":
                field.additional_attribute = countryList;
                break;
            case "lead_owner":
                field.additional_attribute = userList;
                break;
            case "sales_stage":
                if (field.dataValues) {
                    field.dataValues["value"] = (saleStageList && saleStageList[0] && saleStageList[0].key) ? saleStageList[0].key : '';
                }
                field.additional_attribute = saleStageList;
                break;
        };

        return field;
    };

    custom_fields.forEach(custom_field => {
        if ((custom_field.control_type == "dropdown" || custom_field.control_type == "radio" || custom_field.control_type == "checkbox") && custom_field.additional_attribute) {
            custom_field.additional_attribute = Object.values(JSON.parse(custom_field.additional_attribute));
        } else {
            custom_field = createDropdownAttribute(custom_field);
        };
    });

    return [err, custom_fields];
};

module.exports.fieldsWithAttribute = fieldsWithAttribute;

const getCustomFieldsOfType = async function (sectionType) {
    const sectionInfo = {
        "lead": {
            $or: ['LEAD_CLIENT', 'LEAD_CLIENT_COMPANY', 'LEAD_CLIENT_CONTACT']
        },
        "client": {
            $or: ['LEAD_CLIENT', 'LEAD_CLIENT_COMPANY', 'LEAD_CLIENT_CONTACT']
        },
        "supplier": "SUPPLIER",
        "call": ['LEAD_CLIENT', 'LEAD_CLIENT_COMPANY', 'LEAD_CLIENT_CONTACT',"SUPPLIER"]
    };

    const fieldInfo = {
        "lead": {
            $or: ['LEAD', 'BOTH']
        },
        "client": {
            $or: ['CLIENT', 'BOTH']
        },
        "supplier": "SUPPLIER",
        "call" : ['LEAD', 'BOTH','CLIENT','SUPPLIER']
    };

    const [err0, sections] = await to(
        Section.findAll({
            where: {
                type: sectionInfo[sectionType],
                is_hidden: {
                    $ne: 1
                }
            },
            include: [{
                model: CustomField,
                as: "custom_fields",
                where: {
                    table_name: {
                        $ne: null
                    },
                    type: fieldInfo[sectionType]
                }
            }],
            order: [
                ['priority_order', 'ASC']
            ]

        }).map(el => el.get({
            plain: true
        }))
    );

    if (err0) {
        return [err0, null];
    };

    let customFields = [];
    sections.forEach(element => {
        customFields = [...customFields, ...addSectionNameInFields(element.name, element.custom_fields)];
    });

    const [err, fields] = await fieldsWithAttribute(customFields);

    return [err, fields];

};

module.exports.getCustomFieldsOfType = getCustomFieldsOfType;

const addSectionNameInFields = (sectionName = '', customFields = []) => {
    customFields.forEach(field => {
        field["section_name"] = sectionName;
    })
    return customFields;
};

