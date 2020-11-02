/**
 * Created by cis on 28/8/18.
 */
const FormDefaultFields = require('../../models').form_default_fields;
const Section = require('../../models').sections;
const CustomField = require('../../models').custom_fields;
const { fieldsWithAttribute } = require('../../services/createAttributeForCustomFields');

// getting all sale stages
const getAll = async function (req, res) {
    let err, data;
    [err, data] = await to(
        FormDefaultFields.findAll({
            include: [{
                model: CustomField,
                as: 'custom_field',
            }]
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        defaultFields: data,
        message: 'FormDefaultFields got successfully.'
    }, 200);
};
module.exports.getAll = getAll;

// getting all sale stages
const get = async function (req, res) {
    let err, data;
    let item_type = req.params.type;

    [err, data] = await to(
        FormDefaultFields.findAll({
            where: {
                item_type: item_type
            },
            include: [{
                model: CustomField,
                as: 'custom_field',
                include: [{
                    attributes : ["description"],
                    model: Section
                }]
            }],
            order: [
                ['priority_order', 'ASC']
            ]
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    let customFields = [];
    data.forEach(element => {
        customFields.push(element.custom_field);
    });

    const [err1, fields] = await fieldsWithAttribute(customFields);
    
    if (err1) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        defaultFields: fields,
        message: 'FormDefaultFields got successfully.'
    }, 200);
};
module.exports.get = get;

//Get all lead sections 
const getExtraCustomFields = async function (req, res) {

    let sections, err, sectionType, defaultFields;
    const sectionInfo = {
        1 : {$or: ['LEAD_CLIENT','LEAD_CLIENT_COMPANY','LEAD_CLIENT_CONTACT']},
        2 : {$or: ['LEAD_CLIENT','LEAD_CLIENT_COMPANY','LEAD_CLIENT_CONTACT']},
        3 : "SUPPLIER"
    };

    sectionType = req.params.type;

    [err, sections] = await to(
        Section.findAll({
            where: {
                type: sectionInfo[sectionType]
            },
            include: [{
                model: CustomField,
                as: 'custom_fields'
            }]
        })
    );

    if (err) {
        return ReE(res, err);
    }

    [err, defaultFields] = await to(
        FormDefaultFields.findAll({
            where: {
                item_type: sectionType
            },
            include: [{
                model: CustomField,
                as: 'custom_field'
            }],
            order: [
                ['priority_order', 'ASC']
            ]
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    let tampArray = [];
    sections.forEach((value) => {
        tampArray = [...tampArray, ...value.custom_fields];
    });

    let extraField = tampArray.filter((x) => !defaultFields.some(y => x.id == y.custom_field_id));
    
    return ReS(res, {
        extraField: extraField,
        defaultFields: defaultFields
    });
};

module.exports.getExtraCustomFields = getExtraCustomFields;