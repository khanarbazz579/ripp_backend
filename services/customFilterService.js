const Sequelize = require('sequelize');
const Models = require('./../models');
const CustomFields = Models.custom_fields;


/**
 * @method getCustomFieldById
 * @param {*number} fieldId :- custom field Id.
 * @description Method to get the custom field by Id.
 * @returns {*Object} custom field object.
 * @author Gaurav V.
 */
 const getCustomFieldById = async (fieldId) => {
    const [err, fields] = await to(CustomFields.findByPk(fieldId));
    return [err, fields];
}


/**
 * @method filterContacts
 * @param {*Array <Object>} fields :- filter array
 * @param {*res <Object>} res :- http response object
 * @description Method to filter contacts as per JSON filter fields passed 
 * @returns {*Object} Data or err  http response object.
 * @author Gaurav V.
 */
const filterContacts = async function (fields, res) {

    let {includedObj,mainTableConditions} = await createContactIncludeModelForFilterFields(fields,'contacts');

    const [leadErr, leads] = await to(
        Models.contacts.findAll({
            where: mainTableConditions,
            include: includedObj,
            order: [
                [Sequelize.col('created_at'), 'ASC'],
            ]
        })
    );

    if (leadErr) {
        return ReE(res, leadErr, 422);
    }

    return ReS(res, {
        data: leads
    }, 200);

};


/**
 * @method makeOrFilterInstance
 * @param {*Object} filter_fields :- filter object
 * @description this method choose the decide method to make filter object for child(for details) or parent table.
 * @returns {*Object} key contains the table name with where conditions.
 * @author Gaurav V.
 */
const makeOrFilterInstance = (filter_fields) => {
    let resultFilter = new Object();
    let field = filter_fields;
    resultFilter[field.custom_field.table_name] = (field.custom_field.model_name ?
        getOrFilterObject(field.custom_field.model_name, resultFilter[field.custom_field.table_name], field) :
        getAdditionalFieldFilterObject(resultFilter[field.custom_field.table_name], field));
    return resultFilter;
};


/**
 * @method getOrFilterObject
 * @param {*Object} currentObject 
 * @param {*String} model_name :- tabble column name
 * @description method creates where object form the current object for details main parant table 
 * @returns model structure for where conditions required for sequelize for details main parent table 
 * @author Gaurav V.
 */
const getOrFilterObject = (model_name, currentObject = {
    [model_name]: {
        $or: []
    }
}, {
    option,
    value
}) => {
    if (!currentObject[model_name]) {
        currentObject[model_name] = {
            $or: []
        }
    }
    currentObject[model_name].$or.push({
        [option]: value
    });
    return currentObject;
};

/**
 * @method getAdditionalFieldFilterObject
 * @param {*Object} currentObject 
 * @description method creates where object form the current object for details childs table 
 * @returns model structure for where conditions required for sequelize for details childs table 
 * @author Gaurav V.
 */
const getAdditionalFieldFilterObject = (currentObject = {
    $or: []
}, {
    custom_field_id,
    option,
    value
}) => {
    currentObject.$or.push({
        custom_field_id: custom_field_id,
        field_value: {
            [option]: value
        }
    });
    return currentObject;
};

/**
 * @method createContactIncludeModelForFilterFields
 * @param {*Array<Object>} filter_fields 
 * @param {*string} mainTableName :- name of main parent table to filter
 * @description for getting the include model structure ie. array of included object with wher conditions and db model with parent childd relations
 * @returns model structure required for sequelize
 * @author Gaurav V.
 */
const createContactIncludeModelForFilterFields = async (filter_fields,mainTableName,owner_ids) => {
    let reqBody = {
        leads_clients : {
            owner: {
                $in: owner_ids
            }
        }
    };

    for (let i = 0; i < filter_fields.length; i++) {
        let filter = filter_fields[i];
        [err, filter['custom_field']] = await getCustomFieldById(filter.custom_field_id,i);
        if (!err && filter.custom_field) {
            const newInstance = makeOrFilterInstance(filter);
            Object.keys(newInstance).forEach((key) => {
                if (!reqBody[key] || !reqBody[key].$and) {
                    reqBody[key] = {
                        ...reqBody[key],
                        '$and': []
                    };
                };
                if (Object.keys(newInstance[key]).length) {
                    reqBody[key].$and.push(newInstance[key]);
                };
            });
        }
    }
    
    const createInclModel = (PtableName, CtableName = null) => {
        let tempObj = {
            model: Models[PtableName],
            where: reqBody[PtableName] || {},
            as: PtableName === 'leads_clients' ? 'lead_client' : PtableName
        };
        if (CtableName && reqBody[CtableName] && reqBody[CtableName].$and.length) {
            tempObj["include"] = [{
                model: Models[CtableName],
                where: reqBody[CtableName],
                as: CtableName
            }]
        };
        return tempObj;
    }

    let includedObj = [];

    
    if (reqBody['leads_clients'] || reqBody['companies'] || reqBody['lead_client_details'] || reqBody['company_details']) {
        let leadModel = createInclModel('leads_clients','lead_client_details');
        if (reqBody['companies']) {
            if(!leadModel.include){
                leadModel["include"] = [];
            }
            leadModel["include"].push(createInclModel('companies','company_details'));
        };

        includedObj.push(leadModel)
    };

    if (reqBody['contact_details']) {
        includedObj.push(createInclModel('contact_details'));
    }; 
 
    if (reqBody['suppliers'] || reqBody['supplier_details']) {
        includedObj.push(createInclModel('suppliers','supplier_details'));
    }; 
  
    return {
        includedObj,
        mainTableConditions : reqBody[mainTableName]
    };
};

module.exports = {
    createContactIncludeModelForFilterFields,
    getCustomFieldById
}