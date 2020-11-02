const Section = require('../../models').sections;
const CustomField = require('../../models').custom_fields;
const ContactDetail = require('../../models').contact_details;
const CompanyDetail = require('../../models').company_details;
const LeadClientDetail = require('../../models').lead_client_details;
const UserDetail = require('../../models').user_details;
const { attachPermissions, addSectionPermission } = require('../../services/CustomFieldPermissionService');

let allSectionArray = [];
let allFieldsArray = [];
let deletedFields = [];
let sectionResponseObject = [];
let responseSuccessMessage = [];

const validateSection = async (object) => {

    let sectionErrorArray = [];
    let errorIndex = 0;

    for (var i = 0; i < object.length; i++) {
        let sectionObject = object[i];

        if( isNaN(sectionObject.id)){
            sectionObject.id = null;
        }

        if (!sectionObject.name) {
            sectionErrorArray[errorIndex] = "Name is required in section-" + (i + 1);
            errorIndex++;
        }
        if (!sectionObject.type) {
            sectionErrorArray[errorIndex] = "Type is required in section-" + (i + 1);
            errorIndex++;
        }
    }

    return sectionErrorArray;
}

const validateCustomField = async (object, sectionId = 0) => {
    let fieldErrorArray = [];
    let fieldErrorIndex = 0;
    
    for (var i = 0; i < object.length; i++) {
        let customFieldObject = object[i];

        if (sectionId) {
            customFieldObject.section_id = sectionId;
        }

        if (!customFieldObject.label && !(customFieldObject.control_type == "empty_field")) {
            fieldErrorArray[fieldErrorIndex] = "Field label is required in field-" + (i + 1);
            fieldErrorIndex++;
        }
        if (!customFieldObject.control_type) {
            fieldErrorArray[fieldErrorIndex] = "Field control type is required in field-" + (i + 1);
            fieldErrorIndex++;
        }
        if (!customFieldObject.section_id && !(customFieldObject.control_type == "empty_field")) {
            fieldErrorArray[fieldErrorIndex] = "Field section id is required in field-" + (i + 1);
            fieldErrorIndex++;
        }
    }

    return fieldErrorArray;
}

// Based on the third parameter, this will create and update the custom field 
const createCustomField = async (field, sectionObj, type, res) => {
    let createdField;

    field.section_id = sectionObj.id;
    
    let option = {};
    if (field.additional_attribute && typeof (field.additional_attribute) == "object") {
        field.additional_attribute.forEach(function (value, index) {
            let optionValues = {}
            optionValues['key'] = value.key
            optionValues['value'] = value.value
            option[index] = optionValues
        });
        field.additional_attribute = JSON.stringify(option);
    }

    if (type == "create") {
        createdField = await (CustomField.create(field));
        createdField = createdField.toJSON();
    } else if (type == "update") {
        [err, createdField] = await to(
            CustomField.findOne({
                where: { id: field.id }
            })
        );
        if (createdField) {
            createdField = await createdField.update(field);
        }
    }

    if(field.permissions) {
        let [permErr, success] = await to(attachPermissions(createdField, field.permissions, sectionObj));
        if(permErr) return ReE(res, permErr, 422);
    }
    
    return createdField;
}

// Create a section 
const createSection = async (res, object) => {
    if (object.length > 0) {

        for (var i = 0; i < object.length; i++) {
            let sectionObject = object[i];

            if (sectionObject.id) {

                let fieldsArray = [];

                if (sectionObject.custom_fields) {

                    let isCustomFieldError = await (validateCustomField(sectionObject.custom_fields));

                    if (isCustomFieldError.length) {
                        return ReE(res, { success: false, message: isCustomFieldError }, 401);
                    }
                    
                    for (let i = 0; i < sectionObject.custom_fields.length; i++) {
                        let customField = sectionObject.custom_fields[i];
                        let createdField;
                        if (allFieldsArray.indexOf(customField.id) != -1) {
                            createdField = await createCustomField(customField, sectionObject, "update", res);
                        } else {
                            createdField = await createCustomField(customField, sectionObject, "create", res);
                        }
                        fieldsArray.push(createdField);
                    }
                }

                [err, updatedSection] = await to(Section.findOne({
                    where: { id: sectionObject.id }
                }));

                if (err) {
                    return ReE(res, err, 422);
                }

                [err, updatedSection] = await to(
                    updatedSection.update(sectionObject)
                );

                if (err) {
                    return ReE(res, err, 422);
                }
                updatedSection = updatedSection.toJSON();
                updatedSection.custom_fields = fieldsArray;
                sectionResponseObject[i] = updatedSection;
                responseSuccessMessage[i] = "Section Updated Successfully.";
            } else {
                let newSection = await (Section.create(sectionObject));

                if (newSection) {

                    let [err, permission] = await to(addSectionPermission(newSection));

                    if(err) {
                        return ReE(res, { success: false, message: err }, 401); 
                    }

                    if (sectionObject.custom_fields.length > 0) {
                        let isCustomFieldError = await (validateCustomField(sectionObject.custom_fields, newSection.id));
                        if (isCustomFieldError.length) {
                            return ReE(res, { success: false, message: isCustomFieldError }, 401);
                        }

                        for (let i = 0; i < sectionObject.custom_fields.length; i++) {
                            newSection.custom_fields = []
                            let createdField = await createCustomField(sectionObject.custom_fields[i], newSection, "create", res);
                            newSection.custom_fields.push(createdField)
                        }
                    }
                    newSection = newSection.toJSON();
                    sectionResponseObject[i] = newSection;
                    responseSuccessMessage[i] = "Section Created Successfully.";
                }
            }
        }
        return true;
    }
}

//Create a section object
const create = async (req, res) => {

    let sectionObjects = req.body.sections;
    let deletedSections = [];
    deletedSections = req.body.deleted_section;
    deletedFields = req.body.deleted_custom_fields;

    // Getting all custom fields id from db and assigning to variable
    await (
        CustomField.findAll({
            attributes: ['id'],
        }).then((customFields) => {
            customFields.forEach(function (element) {
                allFieldsArray.push(element.id);
            })
        })
    );

    // Getting all section id from db and assigning to variable
    await (
        Section.findAll({
            attributes: ['id'],
        }).then((sections) => {
            sections.forEach(function (element) {
                allSectionArray.push(element.id);
            })
        })
    );

    // Removing all custom fields objects which matches 
    // id's present in deleted_custom_fields
    if (deletedFields.length > 0) {
        let filter = {
            custom_field_id: {
                $in: deletedFields
            }
        }
        let fieldFilter = {
            id: {
                $in: deletedFields
            }
        }
        await removeField(ContactDetail, filter);
        await removeField(CompanyDetail, filter);
        await removeField(LeadClientDetail, filter);
        await removeField(UserDetail, filter);
        await removeField(CustomField, fieldFilter);
    }

    // Validating lead section objects
    let isLeadSectionError = await (validateSection(sectionObjects));
    if (isLeadSectionError.length) {
        return ReE(res, { success: false, message: isLeadSectionError }, 401);
    }

    // Calling method for lead with lead objects
    await (createSection(res, sectionObjects))

    // Removing all sections objects which matches 
    // id's present in deleted_section
    for (var i = 0; i < allSectionArray.length; i++) {
        if (deletedSections.indexOf(allSectionArray[i]) != -1) {
            // Removing section
            await (
                Section.destroy({
                    where: {
                        id: allSectionArray[i]
                    }
                })
            );
        }
    }

    return ReS(res, { success: true, message: responseSuccessMessage, sections: sectionResponseObject });
}

//Remove references of custom field
const removeField = async (model, filter) => {
    await (
        model.destroy({
            where: filter
        })
    );
    return;
}
module.exports.create = create;