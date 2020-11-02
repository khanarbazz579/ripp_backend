const Section = require('../../models').sections;
const CustomField = require('../../models').custom_fields;
const FormDefaultFields = require('../../models').form_default_fields;
const Sequelize = require('sequelize')
const getAll = async function (req, res) {

    let sections = [], err, sectionType;

    if ((req.params.type == "lead" || req.params.type == "client" || req.params.type == "user" || req.params.type == "supplier")) {
        sectionType = req.params.type;

        const sectionInfo = {
            "lead" : {
                $or: [
                    { $eq: 'LEAD_CLIENT' },
                    { $eq: 'LEAD_CLIENT_COMPANY' },
                    { $eq: 'LEAD_CLIENT_CONTACT' }
                ]
            },
            "client" : {
                $or: [
                    { $eq: 'LEAD_CLIENT' }, 
                    { $eq: 'LEAD_CLIENT_COMPANY' },
                    { $eq: 'LEAD_CLIENT_CONTACT' }
                ]
            },
            "supplier" : {
                $eq: 'SUPPLIER'
            },
            "user" : {
                $eq: 'USER'
            },
        };

        const customFieldInfo = {
            "lead" : {
                $or: [
                    { $eq: 'LEAD' },
                    { $eq: 'BOTH' }
                ]
            },
            "client" : {
                $or: [
                    { $eq: 'LEAD' },
                    { $eq: 'BOTH' }
                ]
            },
            "supplier" : {
                $eq: null
            },
            "user" : {
                $eq: null
            },
        };

        try {
            [err, sections] = await to(
                Section.findAll({
                    where: {
                        type: sectionInfo[sectionType]
                    },
                    include: [{
                        model: CustomField,
                        as: 'custom_fields',
                        where: {
                            type: customFieldInfo[sectionType]
                        },
                        include: [{
                            model: FormDefaultFields,
                        }],
                        required: false
                    }],
                    order: [
                        [ Sequelize.col('sections.priority_order'), 'ASC'],
                        [ Sequelize.col('custom_fields.client_priority_order'), 'ASC']
                    ]
                }).map(el => el.get({ plain: true }))
            );

            if (sections) {
                for (let section of sections) {
                    for (let custom_field of section.custom_fields) {
                        if (custom_field.additional_attribute) {
                            custom_field.additional_attribute = Object.values(JSON.parse(custom_field.additional_attribute));
                        }
                    }
                }
            }

            
            if (err) {
                return ReE(res, err);
            }

            return ReS(res, { 
                sections : sections
            });

        } catch (err) {
            return ReE(res, { success: false, message: "Exception: "+err.message }, 401);
        }
    } else {
        return ReE(res, { success: false, message: 'It should have valid requested type.' }, 401);
    }
}
module.exports.getAll = getAll;