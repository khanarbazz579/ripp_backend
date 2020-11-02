const {
    leads_clients
} = require('../../models');
const Models = require('../../models');
const Sequelize = require("sequelize");
const {
    getCustomFiltersWithCustomFields
} = require('../customFilterController/getCustomFilter');
// for getting filter data 
const getleadFilterData = async function (req, res) {
    const {
        saleStageIds,
        customFilterIds,
        entityType,
        leads_client
    } = req.body;
    let leads = [];

    let user_id = [req.user.id],
        searched = '';
    if (leads_client) {
        searched = leads_client.search ? leads_client.search : '';
    }
    if (req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }

    if (!Array.isArray(saleStageIds)) {
        return ReE(res, "saleStageIds should be an array", 422);
    };

    if (!Array.isArray(customFilterIds)) {
        return ReE(res, "customFilterIds should be an array", 422);
    };

    if (!customFilterIds.length && entityType == "LEAD" && !saleStageIds.length) {
        return ReS(res, {
            leads: []
        }, 200);
    };


    let reqBody = {
        leads_clients: {
            $and: [{
                'type': entityType
            }],
            $or: [{
                    owner: {
                        $in: user_id
                    }
                },
                {
                    id: {
                        $in: Models.sequelize.literal('(SELECT lead_id FROM `leads_shared_records` WHERE user_id IN (' + user_id.join(',') + '))')
                    }
                },

            ]
        },
        contacts: {
            entity_type: "LEAD_CLIENT",
        },
        companies: {
            entity_type: "LEAD_CLIENT",
        },
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
    if (leads_client.search) {
        reqBody.companies['name'] = {
            $like: '%' + searched + '%'
        }
    }

    if (saleStageIds.length && entityType == "LEAD") {
        reqBody.leads_clients["sales_stage_id"] = saleStageIds;
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
            createInclModel('companies', 'company_details'),
        ]
        if (reqBody['lead_client_details'].$and.length) {
            includedObj.push(createInclModel('lead_client_details'));
        }

        includedObj.push({
            model: Models['lost_lead_fields'],
            as: 'lost_lead_fields'
        });

        includedObj.push({
            model: Models['sales_stages'],
            as: 'sales_stage'
        });

        const [leadErr, resultLeads] = await to(
            leads_clients.findAll({
                where: reqBody['leads_clients'],
                include: includedObj,
                order: [
                    [Sequelize.col('created_at'), 'ASC'],
                ]
            })
        );

        if (leadErr) {
            return ReE(res, leadErr, 422);
        };
        leads = resultLeads;
    }
	
	
	
	if (entityType == "CLIENT") {

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
            createInclModel('companies', 'company_details'),
        ]
        if (reqBody['lead_client_details'].$and.length) {
            includedObj.push(createInclModel('lead_client_details'));
        }


        const [leadErr, resultLeads] = await to(
            leads_clients.findAll({
                where: reqBody['leads_clients'],
                include: includedObj,
                order: [
                    [Sequelize.col('created_at'), 'ASC'],
                ]
            })
        );

        if (leadErr) {
            return ReE(res, leadErr, 422);
        };
        leads = resultLeads;
    }




    const [err, customFilter] = await getCustomFiltersWithCustomFields(user_id, entityType, customFilterIds);

    if (err) {
        return ReE(res, err, 422);
    }

    await asyncForEach(customFilter, async filter => {
        let newReqBody = {
            leads_clients: {
                $and: [{
                    'type': entityType
                }],
                $or: [{
                        owner: {
                            $in: user_id
                        }
                    },
                    {
                        id: {
                            $in: Models.sequelize.literal('(SELECT lead_id FROM `leads_shared_records` WHERE user_id IN (' + user_id.join(',') + '))')
                        }
                    },

                ]
            },
            contacts: {
                entity_type: "LEAD_CLIENT",
            },
            companies: {
                entity_type: "LEAD_CLIENT",
            },
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
        if (filter.additional_attributes && filter.additional_attributes.lead_status) {
            newReqBody.leads_clients["sales_stage_id"] = filter.additional_attributes.lead_status;
        }
        const outPut = await getCustomFilterOutput(newReqBody, filter);
        outPut.forEach((value) => {
            let found = leads.find(currentLead => {
                return currentLead.id == value.id
            });
            if (!found) {
                leads.push(value);
            }
        })
        if (err) {
            return ReE(res, err, 422);
        }
    });



    return ReS(res, {
        leads: leads
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

const getCustomFilterOutput = async (reqBody, filter) => {

    const newInstance = makeOrFilterInstance(filter);
    Object.keys(newInstance).forEach((key) => {

        if (!reqBody[key] || !reqBody[key].$and) {
            reqBody[key] = {
                ...reqBody[key],
                '$or': []
            };
        };
        if (Object.keys(newInstance[key]).length) {
            reqBody[key].$or.push(newInstance[key]);
        };
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
        createInclModel('companies', 'company_details'),
    ]
    if (reqBody['lead_client_details'].$and.length) {
        includedObj.push(createInclModel('lead_client_details'));
    }

    includedObj.push({
        model: Models['lost_lead_fields'],
        as: 'lost_lead_fields'
    });

    includedObj.push({
        model: Models['sales_stages'],
        as: 'sales_stage'
    });

    const [leadErr, leads] = await to(
        leads_clients.findAll({
            where: reqBody['leads_clients'],
            include: includedObj,
            order: [
                [Sequelize.col('created_at'), 'ASC'],
            ]
        })
    );

    if (leadErr) {
        return ReE(res, leadErr, 422);
    };

    return leads;
}

module.exports = {
    getleadFilterData
};