const db = require('../../models')
const Notification = db.notifications;
const Task = db.tasks;
const Todo = db.todos;
const TodoContact = db.todo_contacts;
const Event = db.events;
const Contact = db.contacts;
const LeadClient = db.leads_clients;
const Company = db.companies;
const Category = db.categories;
const GlobalNotificationSetting = db.global_notification_settings;
const EventRecipient = db.event_recipients;
const FileNotificationDetail = db.file_notification_details;
const Supplier = db.suppliers;
const Emails = db.emails;
const EmailTrackingDetails = db.email_tracking_details;
const Sequelize = require('sequelize');

const getAll = async function(req, res) {
    let err, notifications, notificationCount;

    let min_time = req.body.min_time;
    let u_id = req.body.user_id;
    let type = req.body.type;

    const notification = {
        "ALL": {
            $or: ['CALL', 'EVENT', 'EVENT_ACCEPT', 'EVENT_REJECT', 'EVENT_MAY_BE', 'TODO', 'FILE', 'EMAIL']
        },
        "ACTIVITIES": {
            $or: ['CALL', 'EVENT', 'EVENT_ACCEPT', 'EVENT_REJECT', 'EVENT_MAY_BE', 'TODO', 'EMAIL']
        },
        "EVENT": {
            $or: ['EVENT', 'EVENT_ACCEPT', 'EVENT_REJECT', 'EVENT_MAY_BE']
        },
        "TODO": "TODO",
        "CALL": "CALL",
        "FILE": "FILE",
        "EMAIL": "EMAIL"
    };

    [err, notifications] = await to(
        Notification.findAll({
            include: [{
                    model: Task,
                    as: "task",
                    where: {
                        '$notifications.type$': "CALL"
                    },
                    include: [{
                        attributes: ['id', 'first_name', 'last_name', 'profile_image', 'email', 'phone_number'],
                        model: Contact,
                        as: 'contact',
                        include: [{
                            attributes: ['id', 'type'],
                            model: LeadClient,
                            as: "lead_client",
                            include: [{
                                attributes: ['id', 'name'],
                                model: Company,
                                as: 'companies'
                            }]
                        }]
                    }],
                    required: false
                },
                {
                    model: Emails,
                    as: "emails",
                    where: {
                        '$notifications.type$': "EMAIL"
                    },
                    include: [{
                        model: EmailTrackingDetails,
                        as: 'email_tracking_details'
                    }],
                    required: false
                },
                {
                    model: Todo,
                    as: "todo",
                    where: {
                        '$notifications.type$': "TODO"
                    },
                    include: [{
                            attributes: ['id', 'name'],
                            model: Category,
                            as: 'category',
                        },
                        {
                            attributes: ['id'],
                            model: TodoContact,
                            as: 'contacts',
                            include: [{
                                attributes: ["first_name", "last_name", "email"],
                                model: Contact,
                                as: "contacts"
                            }]
                        }
                    ],
                    required: false
                },
                {
                    model: Event,
                    as: "event",
                    where: Sequelize.or({ '$notifications.type$': "EVENT" }, { '$notifications.type$': "EVENT_ACCEPT" }, { '$notifications.type$': "EVENT_REJECT" }, { '$notifications.type$': "EVENT_MAY_BE" }, ),
                    required: false
                },
                {
                    model: EventRecipient,
                    as: "event_recipient",
                    where: Sequelize.or({ '$notifications.type$': "EVENT_ACCEPT" }, { '$notifications.type$': "EVENT_REJECT" }, { '$notifications.type$': "EVENT_MAY_BE" }, ),
                    include: [{
                        attributes: ['id', 'first_name', 'last_name', 'profile_image', 'email', 'phone_number'],
                        model: Contact,
                        as: 'contact',
                        include: [{
                            attributes: ['id', 'type'],
                            model: LeadClient,
                            as: "lead_client",
                            include: [{
                                attributes: ['id', 'name'],
                                model: Company,
                                as: 'companies'
                            }]
                        }]
                    }],
                    required: false
                },
                {
                    model: FileNotificationDetail,
                    as: "file_notification_detail",
                    where: {
                        '$notifications.type$': "FILE"
                    },
                    include: [{
                            attributes: ['id', 'owner', 'type'],
                            model: LeadClient,
                            as: 'lead_client',
                            include: [{
                                attributes: ['id', 'first_name', 'last_name'],
                                model: Contact,
                                as: 'contacts',
                            }]
                        },
                        {
                            model: Supplier,
                            as: 'supplier',
                            include: [{
                                attributes: ['id', 'first_name', 'last_name'],
                                model: Contact,
                                as: 'contacts',
                            }]
                        }
                    ],
                    required: false
                },
                {
                    attributes: ['is_active'],
                    model: GlobalNotificationSetting,
                    as: 'notification_type',
                    where: {
                        is_active: 1
                    }
                }
            ],
            where: {
                user_id: u_id,
                target_time: {
                    $lt: min_time
                },
                type: notification[type]
                //is_miss:1
            },
            limit: 10,
            order: [
                ['target_time', 'DESC']
            ]
        }).map(el => el.get({
            plain: true
        }))
    );

    if (notifications) {
        notifications.forEach(notification => {
            if (notification && notification.todo) {
                let todoContacts = notification.todo.contacts;
                let contactArray = [];
                todoContacts.forEach(contact => {
                    contactArray.push(contact.contacts)
                })
                notification.todo.contacts = contactArray;
            }
        });
    }

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, { notifications: notifications });
}

module.exports.getAll = getAll;