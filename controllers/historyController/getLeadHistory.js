const db = require('../../models');
const OutcomeTransition = require("../../models").call_outcomes_transitions;
const Note = require("../../models").notes;
const History = require("../../models").histories;
const Task = require("../../models").tasks;
const Outcome = require("../../models").call_outcomes;
const User = require("../../models").users;
const Contact = require("../../models").contacts;
const Lead = require("../../models").leads_clients;
const Todo = require("../../models").todos;
const TodoContact = require("../../models").todo_contacts;
const EventRecipient = require("../../models").event_recipients;
const Event = require("../../models").events;

//Email history section: 
const EmailSyncService = require("./../../services/EmailSyncService");


const get = async function(req, res) {

    let contacts, tasks, histories, todos, err;

    if (req.params.lead_id && isNaN(parseInt(req.params.lead_id))) {
        return ReE(res, {
            success: false,
            message: 'It should have requested lead id.'
        }, 422);
    } else if (req.params.contact_id && isNaN(parseInt(req.params.contact_id))) {
        return ReE(res, {
            success: false,
            message: 'It should have requested contact id.'
        }, 422);
    }

    let condition;

    if (req.params.lead_id) {
        condition = {
            entity_id: req.params.lead_id
        };
    } else if (req.params.contact_id) {
        condition = {
            id: req.params.contact_id
        };
    }

    let activities = [];

    [err, contacts] = await to(
        Contact.findAll({
            attributes: ['id', 'first_name', 'last_name'],
            where: condition
        }).map(el => el.get({
            plain: true
        }))
    );

    if (contacts) {
        let contactsArray = [];
        contacts.forEach((contact) => {
            contactsArray.push(contact.id)
        })

        if (contactsArray) {

            let tasks = await getCallActivity(contactsArray)

            let emails = await EmailSyncService.getEmailHistory(req.params.lead_id);


            if (emails) {
                emails.forEach((email) => {
                    if (email && email.length > 0) {
                        let taskActivity = {
                            object: email,
                            contact: [],
                            type: "email",
                            start_time: '',
                            end_time: '',
                            user: '',
                            created_at: email.created_at
                        }
                        activities.push(taskActivity)
                    }
                })
            }

            if (tasks) {
                tasks.forEach((task) => {
                    let taskActivity = {
                        object: task,
                        contact: task.contact,
                        type: "call",
                        start_time: task.start,
                        end_time: task.end,
                        user: task.user,
                        created_at: task.created_at
                    }
                    activities.push(taskActivity)
                })
            }

            let histories = await getHistoryActivity(contactsArray)

            if (histories) {
                histories.forEach((history) => {
                    const typeObj = {
                        "NOTE": 'note',
                        "OUTCOME_TRANSITION": 'call-outcome-transition',
                        "INBOUND_CALL": 'inboundCall'
                    };
                    let type = typeObj[history.entity_type];
                    let obj = history.note ? history.note : history.outcome;

                    let historyActivity = {
                        object: obj,
                        contact: history.contact,
                        type: type,
                        start_time: obj && obj.start_time ? obj.start_time : history.created_at,
                        end_time: obj && obj.end_time ? obj.end_time : '',
                        user: history.user,
                        created_at: history.created_at
                    }

                    activities.push(historyActivity)
                })
            }

            let todos = await getTodoActivity(contactsArray);

            if (todos) {
                todos.forEach((todoObj) => {
                    let historyActivity = {
                        object: todoObj.todo,
                        contact: todoObj.contacts,
                        type: 'todo',
                        start_time: todoObj.todo.start,
                        end_time: todoObj.todo.end,
                        user: todoObj.todo.user,
                        created_at: todoObj.created_at
                    }
                    activities.push(historyActivity)
                })
            }

            let events = await getEventActivity(contactsArray)

            if (events) {

                events.forEach((eventRecipient) => {
                    let historyActivity = {
                        object: eventRecipient.event,
                        contact: eventRecipient.contact,
                        type: 'event',
                        start_time: eventRecipient.event ? eventRecipient.event.start : null,
                        end_time: eventRecipient.event ? eventRecipient.event.end : null,
                        user: eventRecipient.event ? eventRecipient.event.user : null,
                        created_at: eventRecipient.created_at
                    }
                    activities.push(historyActivity)
                })
            };

            return ReS(res, {
                history: activities
            });
        }
    }

    if (err) {
        return ReE(res, err);
    }

}
module.exports.get = get;

const getTodoActivity = async (contactsArray) => {

    const [err, todos] = await to(
        TodoContact.findAll({
            where: {
                contact_id: contactsArray
            },
            include: [{
                    model: Todo,
                    as: 'todo',
                    include: [{
                        model: User,
                        as: 'user'
                    }]
                },
                {
                    model: Contact,
                    as: 'contacts'
                }
            ]
        }).map(el => el.get({
            plain: true
        }))
    );
    if (err) {
        console.log("ERR------------------------------", err);
    }

    return todos;
}

const getEventActivity = async (contactsArray) => {
    let events;

    [err, events] = await to(
        EventRecipient.findAll({
            where: {
                $and: [{
                        contact_id: contactsArray
                    },
                    {
                        fixed: 0
                    }
                ]
            },
            include: [{
                    model: Event,
                    as: 'event',
                    include: [{
                        attributes: ['first_name', 'last_name'],
                        model: User,
                        as: 'user'
                    }]
                },
                {
                    attributes: ['id', 'first_name', 'last_name'],
                    model: Contact,
                    as: 'contact'
                },
            ],
        }).map(el => el.get({
            plain: true
        }))
    );

    return events;
}

const getHistoryActivity = async (contactsArray) => {
    let histories;

    [err, histories] = await to(
        History.findAll({
            where: {
                $and: [{
                    contact_id: contactsArray
                }]
            },
            include: [{
                    attributes: ['first_name', 'last_name'],
                    model: Contact,
                    as: 'contact'
                },
                {
                    attributes: ['first_name', 'last_name'],
                    model: User,
                    as: 'user',
                    required: false,
                },
                {
                    model: Note,
                    as: 'note',
                    where: {
                        '$histories.entity_type$': "NOTE"
                    },
                    required: false,
                },
                {
                    model: OutcomeTransition,
                    as: 'outcome',
                    where: {
                        '$histories.entity_type$': "OUTCOME_TRANSITION"
                    },
                    include: [{
                            attributes: ['reason_for_call'],
                            model: Task,
                            as: "task"
                        },
                        {
                            attributes: ['name'],
                            model: Outcome,
                            as: "outcome"
                        }
                    ],
                    required: false,
                }
            ]
        }).map(el => el.get({
            plain: true
        }))
    );
    return histories;
}

const getCallActivity = async (contactsArray) => {
    let tasks;

    [err, tasks] = await to(
        Task.findAll({
            where: {
                contact_id: contactsArray
            },
            include: [{
                    model: Contact,
                    as: 'contact'
                },
                {
                    model: User,
                    as: 'user'
                }
            ]
        }).map(el => el.get({
            plain: true
        }))
    );

    return tasks;
};


// const db = require('../../models');
// const OutcomeTransition = require("../../models").call_outcomes_transitions;
// const Note = require("../../models").notes;
// const History = require("../../models").histories;
// const Task = require("../../models").tasks;
// const Outcome = require("../../models").call_outcomes;
// const User = require("../../models").users;
// const Contact = require("../../models").contacts;

// const get = async function (req, res) {

//     let histories, err, leadId;

//     if (isNaN(parseInt(req.params.lead_id))){
//         return ReE(res, { success: false, message: 'It should have requested lead id.' }, 401);
//     }

//     try {
//         leadId = req.params.lead_id;

//         [err, histories] = await to(
//             History.findAll({
//                 include:[
//                     {
//                         attributes:['first_name', 'last_name'],
//                         model: Contact,
//                         as: 'contact',
//                         where: {
//                             $and:[
//                                 {
//                                     entity_id: leadId
//                                 },
//                                 {
//                                     entity_type: "LEAD_CLIENT"
//                                 }
//                             ]
//                         },
//                     },
//                     {
//                         attributes:['first_name', 'last_name'],
//                         model: User,
//                         as: 'user',
//                         required: false,
//                     },
//                     {
//                         model: Note,
//                         as: 'note',
//                         where:{
//                             '$histories.entity_type$': "NOTE"
//                         },
//                         required: false,
//                     },
//                     {
//                         model: OutcomeTransition,
//                         as: 'outcome',
//                         where:{
//                             '$histories.entity_type$':"OUTCOME_TRANSITION"
//                         },
//                         include: [
//                             {
//                                 attributes: ['reason_for_call'],
//                                 model: Task,
//                                 as: "task"
//                             },
//                             {
//                                 attributes: ['name'],
//                                 model: Outcome,
//                                 as: "outcome"
//                             }
//                         ],
//                         required: false,
//                     },
//                 ],
//                 order: [['created_at', 'DESC']]
//             })
//         );
//         if (err) {
//             return ReE(res, err);
//         }
//         return ReS(res, {
//             history: histories
//         });
//     } catch (err) {
//         return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
//     }
// }
// module.exports.get = get;