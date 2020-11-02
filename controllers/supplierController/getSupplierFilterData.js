const { suppliers } = require('../../models');
const Models = require('../../models');
const {
    getCustomFiltersWithCustomFields
} = require('../customFilterController/getCustomFilter');
// for getting filter data 
const getSupplierFilterData = async function (req, res) {
    const {
        customFilterIds,
        entityType
    } = req.body;

    const user_id = req.user.id;

    if (!Array.isArray(customFilterIds)) {
        return ReE(res, "customFilterIds should be an array", 422);
    };

    const [err, customFilter] = await getCustomFiltersWithCustomFields(user_id, entityType, customFilterIds);

    if (err) {
        return ReE(res, leadErr, 422);
    }

    let reqBody = {
        suppliers: {
            $and: []
        },
        contacts: {
            entity_type: "SUPPLIER",
            $and: []
        },
        companies: {
            entity_type: "SUPPLIER",
            $and: []
        },
        contact_details: {
            $and: []
        },
        company_details: {
            $and: []
        }
    };


    customFilter.forEach(filter => {
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
    });

   
   

    const createInclModel = (PtableName, CtableName = null) => {
        let tempObj = {
            model: Models[PtableName],
            where: reqBody[PtableName],
            as: PtableName
        };
        if (CtableName && reqBody[CtableName].$and.length) {
            tempObj["include"] = [{
                model: Models[CtableName],
                where: reqBody[CtableName],
                as: CtableName
            }]
        };
        return tempObj;
    }

    let includedObj = [
        createInclModel('contacts', 'contact_details'),
     //   createInclModel('companies', 'company_details'),
    ]
   
    let [err1, data] = await to(
        suppliers.findAll({
            where: req.body['suppliers'],
            include: includedObj
        })
    );
    
    if (err1) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        data : data
    }, 200);
};


const makeOrFilterInstance = (filter) => {
    let resultFilter = new Object();
    filter.fields.forEach(field => {
        resultFilter[field.custom_field.table_name] = (field.custom_field.model_name ?
            getOrFilterObject(field.custom_field.model_name, resultFilter[field.custom_field.table_name], field) :
            getAdditionalFieldFilterObject(resultFilter[field.custom_field.table_name], field));
    });
    return resultFilter;
};

const getOrFilterObject = (model_name, currentObject = {
    [model_name]: {
        $or: []
    }
}, {
    option,
    value
}) => {
    console.log("currentObject", currentObject, "model_name", model_name);
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

module.exports.getSupplierFilterData = getSupplierFilterData;