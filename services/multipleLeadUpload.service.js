'use strict';

const multer = require('multer');
const fs = require("fs");
const Models = require('../models');

const { smtpTransport } = require('./awsSesSmtpTransport');

const NameExtentions = {
    uploadDir: './uploads/',
    error_file: "error_file",
    correct_file: 'correct_file',
    error_corrected_file: 'error_corrected_file',
    temp_file: 'temp_file',
    duplicate_record_file: "duplicate_record_file",
    non_duplicate_record_file: "non_duplicate_record_file"
};

const getFileLocation = (refName, fileName) => {
    return NameExtentions.uploadDir + refName + '/' + fileName + ".csv";
};

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const location = NameExtentions.uploadDir + req.body.refName;
        if (!fs.existsSync(NameExtentions.uploadDir)) {
            fs.mkdir(NameExtentions.uploadDir, function(err) {
                if (err) {
                    //console.log("error_1++==>", err.stack, file);
                }
                fs.mkdir(location, function(err) {
                    if (err) {
                        //console.log("error_++3==>", err.stack, file);
                    }
                    cb(null, location);
                });
            })
        } else {
            fs.mkdir(location, function(err) {
                if (err) {
                    // console.log("error3_++==>", err.stack, file);
                }
                cb(null, location);
            });
        };
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});

const multerLeadCSVUpload = function(req, res, next) {
    const upload = multer({
        storage: storage
    });
    const uploadcsvToServer = upload.single('file');
    uploadcsvToServer(req, res, function(err) {
        if (err) {
            console.log("erroorrr", err);
            return res.end("Error uploading file.");
        };
        next();
    })
};



/**
 * checks the error in each line of csv data by matching the custom field attribute with file data.
 * @param {Array<object>} data 
 * @param {Array<object>} customFields 
 * @returns {number} error count per line
 */
const countErrInCsvData = (data, customFields = []) => {
    let dataError = 0;
    for (let fieldElement of customFields) {
        if (fieldElement.additional_attribute) {
            const foundValue = fieldElement.additional_attribute.find(attr => {
                return data[fieldElement.id] == attr.value;
            })
            if (!foundValue) {
                dataError++;
            }
        }
        if (fieldElement.is_required) {
            if (!data[fieldElement.id]) {
                dataError++;
            }
        }
    };
    return dataError;
};
/**
 * convert value of additional attribute to key in data
 * @param {Array<object>} data data streamed by csv parser
 * @param {Array<object>} customFields all custom fields with attributes
 * @returns {Array<object>} data converted
 */
const convertCsvVauleDataIntokey = (data, customFields = []) => {
    for (let fieldElement of customFields) {
        if (fieldElement.additional_attribute && data[fieldElement.id]) {
            const foundValue = fieldElement.additional_attribute.find(attr => {
                return data[fieldElement.id] == attr.value;
            })
            if (foundValue) {
                data[fieldElement.id] = foundValue.key;
            }
        }
    };
    return data;
};

/**
 * creates an object of required format for counting the  data.
 * @param {Array<object>} data data streamed by csv parser
 * @param {Array<object>} customFields all custom fields with attributes
 * @returns {object} data converted
 */

const createIncludeModelStructure = (data, custom_fields = []) => {
    let self = {
        leads_clients: {},
        contacts: {},
        companies: {},
        contact_details: {
            $and: []
        },
        lead_client_details: {
            $and: []
        },
        company_details: {
            $and: []
        }
    };
    custom_fields.forEach(custom_field => {
        if (custom_field) {
            if (custom_field.model_name) {
                self[custom_field.table_name][custom_field.model_name] = data[custom_field.id];
            } else {
                const tempObject = {
                    custom_field_id: custom_field.id,
                    field_value: data[custom_field.id]
                };
                self[custom_field.table_name].$and.push(tempObject);
            }
        };
    });

    const createInclModel = (PtableName, CtableName = null) => {
        let tempObj = {
            model: Models[PtableName],
            where: self[PtableName],
            as: PtableName,
            attributes: []
        };
        if (CtableName && self[CtableName] && self[CtableName].$and.length) {
            tempObj["include"] = [{
                model: Models[CtableName],
                where: self[CtableName],
                as: CtableName,
                attributes: []
            }]
        };
        return tempObj;
    }
    const includedArr = [],
        type = 'lead'
    const lType = type == "lead" ? 'LEAD' : type == 'client' ? 'CLIENT' : "SUPPLIER";
    const eType = lType == "SUPPLIER" ? "SUPPLIER" : "LEAD_CLIENT";

    const isNotBlankObj = (obj) => {
        return !!Object.keys(obj).length;
    };

    if (isNotBlankObj(self['leads_clients'])) {
        self['leads_clients'] = {
            ...self['leads_clients'],
            type: lType
        };
    } else {
        self['leads_clients'] = null;
    };

    if (isNotBlankObj(self['contacts'])) {
        self['contacts'] = {
            ...self['contacts'],
            entity_type: eType
        };
        includedArr.push(createInclModel('contacts', 'contact_details'));
    };

    if (isNotBlankObj(self['companies'])) {
        self['companies'] = {
            ...self['companies'],
            entity_type: eType
        };
        includedArr.push(createInclModel('companies', 'company_details'));
    };

    if (self['lead_client_details'].$and.length) {
        includedArr.push(createInclModel('lead_client_details'));
    };

    return {
        where: self['leads_clients'],
        include: includedArr,
        raw: true,
        attributes: ['id']
    };
};

/**
 * creates an object of required format for counting the  data.
 * @param {Array<object>} data data streamed by csv parser
 * @param {Array<object>} customFields all custom fields with attributes
 * @returns {object} data converted
 */

const createIncludeModelStructureForUpload = (data, custom_fields, user_id) => {
    let self = {
        leads_clients: {},
        contacts: {},
        companies: {},
        contact_details: [],
        lead_client_details: [],
        company_details: []
    };

    Object.keys(data).forEach(key => {
        const custom_field = custom_fields.find(el => el.id == key);
        if (custom_field) {
            if (custom_field.model_name) {
                self[custom_field.table_name][custom_field.model_name] = data[key];
            } else {
                const tempObject = {
                    custom_field_id: custom_field.id,
                    field_value: data[key]
                };
                self[custom_field.table_name].push(tempObject);
            }
        }
    });

    const type = "lead";

    const lType = type == "lead" ? 'LEAD' : type == 'client' ? 'CLIENT' : "SUPPLIER";
    const eType = lType == "SUPPLIER" ? "SUPPLIER" : "LEAD_CLIENT";

    const req_body = {
        ...self.leads_clients,
        user_id: user_id,
        type: lType,
        lead_client_details: self.lead_client_details.length ? self.lead_client_details : [],
        contacts: Object.keys(self.contacts).length ? {
            ...self.contacts,
            entity_type: eType,
            contact_details: self.contact_details.length ? self.contact_details : []
        } : null,
        companies: Object.keys(self.companies).length ? {
            ...self.companies,
            entity_type: eType,
            company_details: self.company_details.length ? self.company_details : []
        } : null
    }
    const createInclModel = (PtableName, CtableName = null) => {
        let tempObj = {
            model: Models[PtableName],
            as: PtableName
        };

        tempObj["include"] = [{
            model: Models[CtableName],
            as: CtableName
        }];

        return tempObj;
    }

    const includedArr = [];

    const isNotBlankObj = (obj) => {
        return !!Object.keys(obj).length;
    };

    if (isNotBlankObj(self['contacts']) || self['contact_details'].length) {
        includedArr.push(createInclModel('contacts', 'contact_details'));
    };

    if (isNotBlankObj(self['companies']) || self['company_details'].length) {
        includedArr.push(createInclModel('companies', 'company_details'));
    };

    if (self['lead_client_details'].length) {
        includedArr.push(createInclModel('lead_client_details'));
    };

    return {
        req_body,
        includedArr
    };
};

/**
 * creates an object of required format for counting the  data.
 * @param {Array<object>} data data streamed by csv parser
 * @param {Array<object>} customFields all custom fields with attributes
 * @returns {object} data converted
 */
const createModelStructureForUpdate = (data, custom_fields, duplicate_check_custom_fields) => {
    let whereObj = {
        leads_clients: {
            where: {},
            reqBody: {}
        },
        contacts: {
            where: {
                entity_type: 'LEAD_CLIENT'
            },
            reqBody: {}
        },
        companies: {
            where: {
                entity_type: 'LEAD_CLIENT'
            },
            reqBody: {}
        }
    };

    let detailObj = {
        contact_details: [],
        lead_client_details: [],
        company_details: []
    };

    Object.keys(data).forEach(key => {
        const custom_field = custom_fields.find(el => el.id == key);
        const duplicate_check_custom_field = duplicate_check_custom_fields.find(el => el.id == key);
        if (duplicate_check_custom_field) {
            if (duplicate_check_custom_field.model_name) {
                whereObj[duplicate_check_custom_field.table_name]['where'][custom_field.model_name] = data[key];
            };
        };
        if (custom_field) {
            if (custom_field.model_name) {
                whereObj[custom_field.table_name]['reqBody'][custom_field.model_name] = data[key];
            } else {
                const tempObject = {
                    reqBody: {
                        custom_field_id: custom_field.id,
                        field_value: data[key]
                    }
                };
                if (duplicate_check_custom_field) {
                    tempObject['where'] = {
                        custom_field_id: custom_field.id,
                        field_value: data[key]
                    };
                };
                detailObj[custom_field.table_name].push(tempObject);
            }
        };
    });

    whereObj.leads_clients['childObj'] = detailObj.lead_client_details;
    whereObj.contacts['childObj'] = detailObj.contact_details;
    whereObj.companies['childObj'] = detailObj.company_details;

    return {
        req_body: whereObj
    };
}

module.exports = {
    multerLeadCSVUpload,
    convertCsvVauleDataIntokey,
    countErrInCsvData,
    smtpTransport,
    createIncludeModelStructure,
    createIncludeModelStructureForUpload,
    createModelStructureForUpdate,
    getFileLocation,
    NameExtentions
};