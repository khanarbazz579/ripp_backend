const LeadsClients = require('../../models').leads_clients;
const LeadClientDetails = require('../../models').lead_client_details;
const Contacts = require('../../models').contacts;
const ContactDetails = require('../../models').contact_details;
const Companies = require('../../models').companies;
const CompanyDetails = require('../../models').company_details;
const Histories = require('../../models').histories;
const lostLeadFields = require('../../models').lost_lead_fields;
const CustomField = require('../../models').custom_fields;
const SaleStage = require('../../models').sales_stages;
const User = require('../../models').users;
const Tasks = require('../../models').tasks;
const Notes = require('../../models').notes;
const CallTransition = require('../../models').call_outcomes_transitions;
const CallOutcome = require('../../models').call_outcomes;
const EventRecipient = require('../../models').event_recipients;
const Event = require('../../models').events;

const Sequelize = require("sequelize");

//Get a lead object through requested id
const get = async function(req, res){
    
    let lead, err, leadId;
      
    if(isNaN(parseInt(req.params.lead_id)) )
        return ReE(res, { success: false, message: 'It should have requested lead id.' }, 401);

    leadId = req.params.lead_id;
    
    [err, lead] = await to(
        LeadsClients.findOne({
            where:{
                id:leadId
            },
            include: [
                {
                    model: Contacts,
                    as: 'contacts',
                    include: [
                        {
                            model: ContactDetails,
                            as: 'contact_details'
                        },
                        {
                            model: Tasks,
                            as: 'tasks',
                            include: [{
                                model: User,
                                as: 'user'
                            }]
                        },
                        {
                            model: EventRecipient,
                            as: 'event_recipients',
                            where:{
                                fixed: 0 
                            },
                            include: [{
                                model: Event,
                                as: 'event',
                                include: [{
                                    attributes: [ 'first_name', 'last_name' ],
                                    model: User,
                                    as: 'user'
                                }]
                            }],
                            required: false
                        }
                    ]
                },
                {
                    model: User,
                    attributes: ['first_name', 'last_name'],
                    as: 'owner_name',
                },
                {
                    model: Companies,
                    as: 'companies',
                    include: [{
                        model: CompanyDetails,
                        as: 'company_details'
                    }]
                },
                {
                    model: LeadClientDetails,
                    as: 'lead_client_details'
                },
                {
                    model: SaleStage,
                    as: 'sales_stage'
                }
            ],
            order: [
                [ Sequelize.col('contacts.priority_order'), 'ASC'],
            ]
        })
    );

    if(err){
        return ReE(res, err);
    }

    return ReS(res, { lead:lead });
}

module.exports.get = get;
