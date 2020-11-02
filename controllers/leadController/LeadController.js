const LeadsClients = require('../../models').leads_clients;
const LeadClientDetails = require('../../models').lead_client_details;
const Contacts = require('../../models').contacts;
const ContactDetails = require('../../models').contact_details;
const Companies = require('../../models').companies;
const CompanyDetails = require('../../models').company_details;
const lostLeadFields = require('../../models').lost_lead_fields;
const SalesStageTransition = require('../../models').sales_stage_transitions;
const CustomField = require('../../models').custom_fields;
const SaleStage = require('../../models').sales_stages;
const History = require('../../models').histories;
const Tasks = require('../../models').tasks;
const User = require('../../models').users;
const ShareFileFolder = require('../../models').share_files_folders;
const FileNotification = require('../../models').file_notification_details;

const create = async function (req, res) {
    let err, lead;
    let user = req.user;

    const leadOwner = req.body.owner || user.id
    let lead_info = Object.assign({
        owner: leadOwner,
        user_id: user.id,
        ...req.body
    });
    [err, lead] = await to(LeadsClients.create(lead_info, {
        include: [{
                model: LeadClientDetails,
                as: 'lead_client_details'
            },
            {
                model: Contacts,
                as: 'contacts',
                include: [{
                    model: ContactDetails,
                    as: "contact_details"
                }]
            },
            {
                model: Companies,
                as: 'companies',
                include: [{
                    model: CompanyDetails,
                    as: 'company_details'
                }]
            }
        ]
    }));

    if (err) return ReE(res, err, 422);

    let [transitionErr, transition] = await to(SalesStageTransition.create({
        current_ss_id: lead_info.sales_stage_id,
        old_ss_id: 0,
        lead_client_id: lead.id
    }));

    return ReS(res, {
        lead: lead,
    }, 201);
};
module.exports.create = create;


const getAll = async function (req, res) {
    let err, leads;
    [err, leads] = await to(
        LeadsClients.findAll({
            include: [{
                    model: LeadClientDetails,
                    as: 'lead_client_details'
                },
                {
                    model: Contacts,
                    as: 'contacts',
                    include: [{
                        model: ContactDetails,
                        as: "contact_details"
                    }]
                },
                {
                    model: Companies,
                    as: 'companies',
                    include: [{
                        model: CompanyDetails,
                        as: 'company_details'
                    }]
                }
            ]
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        leads: leads
    }, 200);
}
module.exports.getAll = getAll;


const update = async function (req, res) {
    let data = req.body;
    const [err, lead] = await updateLead(data);
    if (lead) {
        return ReS(res, {
            leads: lead
        }, 201)
    }
}
module.exports.update = update;

const updateLead = async function (data) {

    let [err, lead] = await to(LeadsClients.findByPk(data.id));

    if (lead) {
        if (lead.sales_stage_id != data.sales_stage_id) {

            let [transitionErr, transition] = await to(SalesStageTransition.create({
                current_ss_id: data.sales_stage_id,
                old_ss_id: lead.sales_stage_id,
                lead_client_id: lead.id
            }));

            if (lead.sales_stage_id == 7) {
                let [identifierEr, identifier] = await to(lostLeadFields.findOne({
                    where: {
                        lead_client_id: lead.id
                    }
                }));

                if (identifier) {
                    [er, identifier] = await to(identifier.destroy());
                }
            }
        }
    }

    [err, lead] = await to(lead.update(data));

    if (err) {
        return [err, null];
    }

    return [null, lead];

}

const remove = async function (req, res) {
    let err, deleted, contacts, task, contactsArray = [], shareFileFolder;
    const _id = req.params.lead_id;

    [err, contacts] = await to(Contacts.findAll({
        attributes: ["id"],
        where: {
            entity_type: 'LEAD_CLIENT',
            entity_id: _id
        }
    }));

    if(contacts){
        contacts.forEach( (contact) => {
            contactsArray.push(contact.id)
        });

        [err, task] = await to(Tasks.destroy({
            where: {
                contact_id: contactsArray
            }
        }));

        [err, shareFileFolder] = await to(ShareFileFolder.destroy({
            where: {
                user_type: 'CONTACT',
                user_id: contactsArray
            }
        }));

        [err, contacts] = await to(Contacts.destroy({
            where: {
                entity_type: 'LEAD_CLIENT',
                entity_id: _id
            }
        }));

        [err, contacts] = await to(FileNotification.destroy({
            where: {
                entity_type: 'LEAD_CLIENT',
                entity_id: _id
            }
        }));

        if (err) {
            return ReE(res, err, 422);
        }        
    }

    [err, deleted] = await to(LeadsClients.destroy({
        where: {
            id: _id
        }
    }));

    if (deleted) {
        [err, deleted] = await to(Companies.destroy({
            where: {
                entity_type: 'LEAD_CLIENT',
                entity_id: _id
            }
        }));
        if (err) {
            return ReE(res, err, 422);
        }
    }

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        leads: _id
    }, 201);

}
module.exports.remove = remove;

// removing bulk data 
const LeadBulkRemove = async function (req, res) {
    const lead_id_array = req.body;
    let err, deleted;

    [err, deleted] = await to(Companies.destroy({
        where: {
            entity_type: 'LEAD_CLIENT',
            entity_id: lead_id_array
        }
    }));

    [err, deleted] = await to(Contacts.destroy({
        where: {
            entity_type: 'LEAD_CLIENT',
            entity_id: lead_id_array
        }
    }));

    [err, deleted] = await to(LeadsClients.destroy({
        where: {
            id: lead_id_array
        }
    }));
    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, {
        leads: lead_id_array,
        massage: "lead removed sucessfully"
    }, 200);
}
module.exports.LeadBulkRemove = LeadBulkRemove;

const bulkUpdate = async function (req, res) {
    let {
        sales_stage_id,
        leadIds,
        ressonUpdated
    } = req.body;
     
    if (sales_stage_id != 7) {
        const [er, identifier] = await to(lostLeadFields.destroy({
            where: {
                lead_client_id: leadIds
            }
        }));
    }else if(ressonUpdated){
        for(let id of leadIds){
            const[errr , identifier] = await to(lostLeadFields.create({
                lead_client_id: id,
                lost_identifier: ressonUpdated
            }))
        }
        
    }

    const [err, updatedRec] = await to(LeadsClients.update({
        sales_stage_id: sales_stage_id,
    }, {
        where: {
            id: leadIds
        }
    }));

    if (err) {
        return ReE(res, err, 422);
    };

    return ReS(res, {
        leads: leadIds,
        updatedRec
    }, 201);
};
module.exports.bulkUpdate = bulkUpdate;


const transferContact = async(req, res) =>{
    [err, contact] = await to(Contacts.update({entity_id:req.body.entity_id},{
        where:{
            id:req.body.id
        }}));
    return ReS(res, {
        lead:req.body,
        massage:"Succefully Transfered"
    }, 200);
}
module.exports.transferContact = transferContact;

const addContact = async(req, res) =>{
    [err , contact] = await to(Contacts.create(req.body))
    if(err){
        return ReE(res, err , 422);
    }
    return ReS(res, { 
        contact :contact,
        massage: "Succefully Created new Contacts"
    },200)
}
module.exports.addContact = addContact;