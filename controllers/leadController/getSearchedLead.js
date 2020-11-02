const {
    leads_clients
} = require('../../models');
const Models = require('../../models');
const Sequelize = require("sequelize");
// for getting filter data 
const getSearchLeadData = async function (req, res) {
    const {
        entityType,
        leads_client
    } = req.body;
    
    let user_id = [req.user.id];

    if(req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }


    let reqBody = {
        leads_clients: {
            $and: [
                // {
                    // type:{
                    //     $in : entityType
                    // }
                
            // }
        ],
            $or: [
                {
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
            name :{
                $like:'%'+leads_client+'%'
            }
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
   if(entityType.length){
       reqBody['leads_clients'].$and =   {type:{
        $in : entityType
    }
}
   }
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
    }

    return ReS(res, {
        leads: leads
    }, 200);

};

module.exports = { getSearchLeadData };