/**
 * Created by cis on 13/7/18.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const Events = require('./../../models').events;
const Contacts = require('./../../models').contacts;
const Company = require('./../../models').companies;
const Notification = require('./../../models').notifications;
const LeadClient = require('./../../models').leads_clients;
const eventRecipients = require('./../../models').event_recipients;
const eventRepeats = require('./../../models').event_repeats;
const deletedEvents = require('./../../models').deleted_events;
const inviteEvents = require('./../../models').invite_events;
const usersModel = require('./../../models').users;
const template = require('./eventTemplate');
var moment = require('moment');
const md5 = require('md5');
const repeatHelper = require('../../helpers/repeatHelper');
const ical = require('ical-generator');
const { smtpTransport } = require('../../services/awsSesSmtpTransport');
const commonFunction = require('../../services/commonFunction');


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description Create new event and store in database.
 */
const create = async function(req, res) {
    let err, event;
    let user = req.user;
    if (!req.body.events) {
        return ReE(res, "Invalid input parameters.", 422);
    }

    let event_info = Object.assign({
        user_id: user.id,
        ...req.body.events
    });
    [err, event] = await to(Events.create(event_info));
    if (err) {
        return ReE(res, err, 422);
    }
    let event_json = event.toJSON();
    req.body.events.id = event_json.id;
    
    await repeatHelper.saveEventRepeat(req.body.events.repeat, req.body.events.endrepeat, event_json.id, 'event', true);
    await saveEventUser(req.body.events, event_json.id, true);

    if (req.body.events.is_send_email) {
        await sendInviteEmails(req.body.events);
    }
    if (event.text_reminder != undefined && event.text_reminder != '') {
        event["reminder"] = event.text_reminder;
        let [err, notification] = await commonFunction.insertNotification(event, "EVENT");
        if (err) {
            return ReE(res, err, 422);
        }
    }

    return ReS(res, {
        event: event_json
    }, 201);
};

/**
 * 
 * @param {Object} event 
 * @description Send invitation email to user those associates with event.
 * @returns undefined
 */
const sendInviteEmails = async function(event) {
    let parms = {};
    let attendees = [];

    event.end = event.end || moment(event.start).hour(moment(event.endTime)).minute(event.endTime);
    
    for (var i = 0; i < event.contact_id.length; i++) {

        if (event.contact_id[i].fixed) {
            orgUser = event.contact_id[i].first_name + ' ' + event.contact_id[i].last_name;
            orgEmail = event.contact_id[i].email;
            break;
        }
    }
    for (var i = 0; i < event.contact_id.length; i++) {
        if (!event.contact_id[i].fixed) {
            attendees.push({
                name: event.contact_id[i].first_name + ' ' + event.contact_id[i].last_name ? event.contact_id[i].last_name : '',
                role: 'REQ-PARTICIPANT',
                rsvp: true,
                status: 'NEEDS-ACTION',
                type: 'INDIVIDUAL',
                email: event.contact_id[i].email
            });
        }
    }
    let subject = getSubject(event);
    let timeTitle = getEventTimeTitle(event);
    for (var i = 0; i < event.contact_id.length; i++) {
        if (event.contact_id[i].email != 'No email address' && !event.contact_id[i].fixed ) {
            let templateText = await template.inviteTemplate(timeTitle, event.start, event.end, event.title, event.contact_id, event.details, event.location, event.contact_id[i].key);
            let startDate = event.start;
            let endDate;
            if (event.end) {
                endDate = event.end;
            } else {
                endDate = startDate;
            }
            smtpTransport.sendMail({
                from: 'no-reply@ripplecrm.com',
                to: event.contact_id[i].email,
                subject: subject,
                html: templateText
            }, function(err) {
                if (err) {
                    parms.message = 'Error in email sending';
                    parms.error = {
                        status: `Invalid_Request: ${err}.`
                    };
                    console.log(JSON.stringify(parms))
                }
            });

        }
    }
}

/**
 * 
 * @param {*} userMail 
 * @param {*} eventMails 
 * @description check emails is valid or not to be send
 * @returns {Boolean}
 */
const checkEmailValid = async(userMail, eventMails) => {

    let temp = true;
    for (let element of eventMails) {
        if (element.email == userMail) {
            if (element.status == '' || element.status == null) {
                temp = true;
            } else {
                temp = false;
                return temp;
            }
        } else {
            temp = true;
        }
    }
    return temp;
}

/**
 * 
 * @param {Object} events 
 * @param {Number} event_id 
 * @param {Boolean} isSave 
 * @description Save attendies in database with event id.
 * @returns {Boolean}
 */
const saveEventUser = async function(events, event_id, isSave) {
    var contacts = [];
    events.contact_id = events.contact_id || [];
    for (let i = 0; i < events.contact_id.length; i++) {

        if (events.contact_id[i].id !== 0) {
            contacts.push({
                contact_id: events.contact_id[i].id,
                event_id: event_id,
                email: events.contact_id[i].email,
                fixed: events.contact_id[i].fixed
            });
        } else {
            contacts.push({
                email: events.contact_id[i].email,
                event_id: event_id
            });
        }
    }
    let error, eventRecipient;
    [error, eventRecipient] = await to(eventRecipients.bulkCreate(contacts, {
        returning: true
    }));
    if (error) {
        return console.log("Error", error);
    }
    let invite_events = [];
    let ierr, ievents;
    for (let i = 0; i < eventRecipient.length; i++) {
        var key = md5(eventRecipient[i].id);
        for (let j = 0; j < events.contact_id.length; j++) {
            if (eventRecipient[i].email === events.contact_id[j].email) {
                events.contact_id[j].key = key;
                eventRecipient[i].status = events.contact_id[j].status;
                eventRecipient[i].message = events.contact_id[j].status ? events.contact_id[j].rmessage : null;
                break;
            }
        }
        invite_events.push({
            key: key,
            event_id: event_id,
            event_recipients_id: eventRecipient[i].id,
            status: eventRecipient[i].status,
            message: eventRecipient[i].message
        });
    }

    // [delErr, inviteDelete] = await to(
    //     inviteEvents.destroy({
    //         where: {
    //             event_id: event_id
    //         }
    //     })
    // );
    [ierr, ievents] = await to(inviteEvents.bulkCreate(invite_events, {
        returning: true
    }));
}

/**
 *
 * @param {*} req 
 * @param {*} res 
 * @description For fetch all events with check repeats.
 * @return undefined
 */
const getAll = async function(req, res) {
    let user = req.user;
    var err, event;
    var events = [];
    let newRepeatedEvents = [];
    
    if (!req.body.currentMonth) {
        return ReE(res, "currentMonth is required", 422);
    }

    let user_id = [user.id];

    if (req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }

    [err, event] = await to(
        Events.findAll({
            where: {
                user_id: {
                    $in: user_id
                },
                created_at: {
                    $gt: '2019-05-07'
                }
            }
        })
    );

    for (var i = 0; i < event.length; i++) {
        var data = {
            base: "main",
            startTime: event[i].start,
            endTime: event[i].end,
            color: event[i].color,
            is_end: event[i].is_end,
            is_end_time: event[i].is_end_time,
            created_at: event[i].created_at,
            details: event[i].details,
            end: event[i].end,
            id: event[i].id,
            is_send_email: event[i].is_send_email,
            startEnd: event[i].start,
            is_all_day: event[i].is_all_day,
            location: event[i].location,
            meeting_room_id: event[i].meeting_room_id,
            start: event[i].start,
            text_reminder: event[i].text_reminder,
            title: event[i].title,
            type: event[i].type,
            updated_at: event[i].updated_at,
            user_id: event[i].user_id,
            contact_id: await getEventContacts(event[i].id, event[i].user_id, event[i].is_send_email),
            is_meeting_room: event[i].is_meeting_room,
            repeat: await repeatHelper.getRepeatDetails(event[i].id, 'event'),
            endrepeat: await repeatHelper.getEndRepeatDetails(event[i].id, 'event'),
            dayDiff: moment(event[i].end).diff(moment(event[i].start), 'days'),
            deletedDay: await getEventDeletedDays(event[i].id)
        };
        events.push(data);
        let tempData = [];
        if (data.repeat) {
            if (req.body.is_all || i < 0) {
                let dayDiff = moment(data.end).diff(moment(data.start), 'days');
                let startDateForProcedure = moment(moment(req.body.currentMonth).startOf('month')).subtract(12, 'day').format('YYYY-MM-DD');
                let endDateForProcedure = moment(moment(req.body.currentMonth).endOf("month")).add(12, 'day').format('YYYY-MM-DD');
                [err, eventsRepeatedList] = await to(
                    Events.sequelize.query(`CALL create_event_repeat('${startDateForProcedure}','${endDateForProcedure}',${data.id})`)
                );

                for (let j = 0; j < eventsRepeatedList.length; j++) {
                    let d = eventsRepeatedList[j];
                    let s = Object.assign(data, {});
                    tempData.push({
                        base: "repeated",
                        start: d.start,
                        end: moment(d.start).add(dayDiff, 'days').hour(moment(d.end).hour()).minute(moment(d.end).minute()),
                        startTime: d.start,
                        endTime: moment(d.start).add(dayDiff, 'days').hour(moment(d.end).hour()).minute(moment(d.end).minute()),
                        color: data.color,
                        is_end: data.is_end,
                        is_end_time: data.is_end_time,
                        created_at: data.created_at,
                        details: data.details,
                        id: data.id,
                        is_send_email: data.is_send_email,
                        startEnd: data.start,
                        is_all_day: data.is_all_day,
                        location: data.location,
                        meeting_room_id: data.meeting_room_id,
                        text_reminder: data.text_reminder,
                        title: data.title,
                        type: data.type,
                        updated_at: data.updated_at,
                        user_id: data.user_id,
                        contact_id: data.contact_id,
                        is_meeting_room: data.is_meeting_room,
                        repeat: data.repeat,
                        endrepeat: data.endrepeat,
                        dayDiff: moment(data.end).diff(moment(data.start), 'days'),
                        deletedDay: data.deletedDay
                    });
                }
            }
        }
        newRepeatedEvents = newRepeatedEvents.concat(tempData);

    }



    newRepeatedEvents = await repeatHelper.filterEventsByEndDateAndDeletedDays(events.concat(newRepeatedEvents));
    if (err) {
        return ReE(res, err, 422);
    }
    newRepeatedEvents = await repeatHelper.getFormatedDateTime(newRepeatedEvents);
    return ReS(res, {
        events: await repeatHelper.getUniqueRecords(newRepeatedEvents)
    }, 200);
};

/**
 * 
 * @param {Number} event_id 
 * @description Fetch events deleted  day's
 * @returns {Array} event
 */
const getEventDeletedDays = async function(event_id) {
    var err, event;
    [err, event] = await to(
        deletedEvents.findAll({
            where: {
                event_id: event_id
            }
        })
    );
    return event;
}

/**
 * 
 * @param {Number} event_id 
 * @param {Number} user_id 
 * @param {Boolean} isInvite 
 * @description Fetch event invitees details
 * @returns {Array} event
 */
const getEventContacts = async(event_id, user_id, isInvite) => {
    let err, event;
    [err, event] = await to(
        eventRecipients.sequelize.query(`
SELECT 
   u.id as event_r_id,
   u.id,
   1 as fixed,
   u.first_name,
   u.last_name,
   "Ripple CRM Ltd" as company,
   u.profile_image as images,
   CONCAT(SUBSTRING(u.first_name,1,1),SUBSTRING(u.last_name,1,1))  as img,
   "(Organiser)" as message,
   0 as status,
   '' as rmessage,
   u.email FROM users as u WHERE u.id = ${user_id}
   UNION ALL 
   SELECT 
   er.id as event_r_id, 
   er.contact_id as id,
   er.fixed,
   if(er.contact_id is null ,er.email,e.first_name) as first_name,
   e.last_name,
   c.name as company,
   e.profile_image as images,
   CONCAT(SUBSTRING( if(er.contact_id is null ,er.email,e.first_name),1,1),SUBSTRING(if(e.last_name is null ,'',e.last_name),1,1))  as img,
   null as message,
   (SELECT ie.status FROM invite_events as ie WHERE er.id = ie.event_recipients_id ORDER BY ie.id DESC LIMIT 1 ) as status,
   (SELECT ie1.message FROM invite_events as ie1 WHERE er.id = ie1.event_recipients_id ORDER BY ie1.id DESC LIMIT 1 ) as rmessage,
   er.email from event_recipients as er LEFT JOIN contacts as e ON e.id = er.contact_id
   LEFT JOIN companies as c on c.entity_id = e.entity_id
   WHERE er.event_id = ${event_id} AND er.fixed <> 1
`)
    );

    event[0] = await getUniqueRecords(event[0]);
    for (let i = 0; i < event[0].length; i++) {

        if (event[0][i].status == 'N' && !event[0][i].fixed) {
            event[0][i].message = "Not attending";
        } else if (event[0][i].status == 'U' && !event[0][i].fixed) {
            event[0][i].message = "Unconfirmed - Event Invite Sent";
        } else if (event[0][i].status == 'Y' && !event[0][i].fixed) {
            event[0][i].message = "Confirmed - Event Invite Sent";
        } else if (event[0][i].status == 'T' && !event[0][i].fixed) {
            event[0][i].message = "Is possibly attending - Event Invite Sent";
        } else if (!event[0][i].fixed && !event[0][i].status) {
            event[0][i].message = "No Invite Sent";
        } else if (event[0][i].fixed) {
            event[0][i].message = "(Organiser)";
        }
        // }
        // if (event[0][i].status == 'N' && !event[0][i].fixed && isInvite) {
        //     event[0][i].message = "Not attending";
        // } else if (event[0][i].status == 'U' && !event[0][i].fixed && isInvite) {
        //     event[0][i].message = "Unconfirmed - Event Invite Sent";
        // } else if (event[0][i].status == 'Y' && !event[0][i].fixed && isInvite) {
        //     event[0][i].message = "Confirmed - Event Invite Sent";
        // } else if (event[0][i].status == 'T' && !event[0][i].fixed && isInvite) {
        //     event[0][i].message = "Is possibly attending - Event Invite Sent";
        // } else if (!event[0][i].fixed && !isInvite && event[0][i].status =='') {
        //     event[0][i].message = "No Invite Sent";
        // } else if (event[0][i].fixed) {
        //     event[0][i].message = "(Organiser)";
        // }
    }
    return (event[0]);
}

const getUniqueRecords = event => {
    var lookup = {};
    var items = event;
    var result = [];
    for (var item, i = 0; item = items[i++];) {
        var email = item.email;
        if (!(email in lookup)) {
            lookup[email] = 1;
            result.push(item);
        }
    }
    return result;
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description fetch contact list 
 * @returns undefined
 */
const getContacts = async function(req, res) {
    let user = req.user;
    let err, contacts;
    [err, contacts] = await to(
        Contacts.findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image'],
            include: [{
                model: LeadClient,
                as: 'lead_client',
                where: {
                    user_id: user.id
                },
                include: [{
                    attributes: ['id', 'name'],
                    model: Company,
                    as: 'companies'
                }]
            }]
        })
    );
    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, {
        contacts: contacts
    }, 200);
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description fetch contact list on change
 * @returns undefined
 */
const getContactsOnChange = async function(req, res) {
    let user = req.user;
    let err, contacts;
    if (!req.body.text) {
        return ReE(res, "text is required", 422);
    }
    let text = req.body.text;
    [err, contacts] = await to(
        Contacts.findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image'],
            include: [{
                model: LeadClient,
                as: 'lead_client',
                where: {
                    user_id: user.id
                },
                include: [{
                    attributes: ['id', 'name'],
                    model: Company,
                    as: 'companies'
                }]
            }],
            where: {
                $or: {
                    first_name: {
                        $like: '%' + text + '%'
                    },
                    email: {
                        $like: '%' + text + '%'
                    }
                }
            }
        })
    );
    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, {
        contacts: contacts
    }, 200);
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description update existing event
 * @returns undefined
 */
const update = async function(req, res) {
    let err, event,flag,attendees =[];
    let eventParams = Object.assign({}, req.body);
    if (!req.params.event_id) {
        return ReE(res, "Event id is required.", 422);
    }



    if (req.body.base == 'repeated') {
        let lastEvent = await getEventStartTime(req.params.event_id);
        req.body.start = lastEvent.start;
        req.body.end = lastEvent.end;
        let start = moment(req.body.startTime);
        let end = moment(req.body.endTime);
        req.body.start = moment(req.body.start).set({ h: start.hour(), m: start.minute() }).format();
        req.body.end = moment(req.body.end).set({ h: end.hour(), m: end.minute() }).format();
        eventParams = Object.assign({}, req.body);
    }


    const fatched_event = req.body;
    const event_id = req.params.event_id;

    [err, event] = await to(
        Events.findByPk(event_id)
    );

    if (event.text_reminder != fatched_event.text_reminder) {
        event["reminder"] = fatched_event.text_reminder;
        let [err, notification] = await commonFunction.updateNotification(event, "EVENT");
        if (err) {
            return ReE(res, err, 422);
        }
    }

    if (err) {
        return ReE(res, err, 422);
    }

    [err, event] = await to(
        event.update(fatched_event)
    );

    if (err) {
        return ReE(res, err, 422);
    }
     [eventErr, eventMails] = await to(eventRecipients.sequelize.query(`SELECT er.email, ie.status FROM event_recipients as er JOIN invite_events AS ie ON ie.event_recipients_id= er.id WHERE er.event_id = ${req.params.event_id}`));
     for (var i = 0; i < eventParams.contact_id.length; i++) {
        flag = await checkEmailValid(eventParams.contact_id[i].email, eventMails[0]);
        if (flag) {
            attendees.push({
                event_r_id: eventParams.contact_id[i].event_r_id,
                 id: eventParams.contact_id[i].id,
                fixed: eventParams.contact_id[i].fixed,
                first_name: eventParams.contact_id[i].first_name,
                last_name: eventParams.contact_id[i].last_name,
                company:eventParams.contact_id[i].company,
                images:eventParams.contact_id[i].images,
                img:eventParams.contact_id[i].img,
                message:eventParams.contact_id[i].message,
                status:eventParams.contact_id[i].status,
                rmessage:eventParams.contact_id[i].rmessage,
                email: eventParams.contact_id[i].email
            });
        }
    }
    eventParams['contact_id'] = attendees;
    let uerr, uevent;
    [uerr, uevent] = await to(
        eventRecipients.destroy({
            where: {
                event_id: event_id
            }
        })
    );
    if(!uerr){
        await saveEventUser(eventParams, event_id);
    }
    await repeatHelper.saveEventRepeat(req.body.repeat, req.body.endrepeat, event_id, 'event', false);
    if (req.body.is_send_email) {
        await sendInviteEmails(eventParams);
    }
   
    return ReS(res, {
        event: event
    }, 200);
};

const getEventStartTime = async(id) => {
    let err, event;
    [err, event] = await to(Events.findOne({
        attributes: ['start', 'end'],
        where: {
            id: id
        }
    }))
    return event;
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description delete existing event by event id.
 * @returns undefined
 */
const remove = async function(req, res) {
    if (!req.body.id) {
        return ReE(res, "Event id is required", 422);
    }
    const event_id = req.body.id;
    let err, event;
    var events = await getEventById(event_id);
    if (req.body.isAll == undefined || req.body.isAll != false) {
        [err, event] = await to(
            eventRepeats.destroy({
                where: {
                    event_id: event_id,
                    repeat_for: 'event'
                }
            })
        );

        // Remove event from database
        [err, event] = await to(
            Events.destroy({
                where: {
                    id: event_id
                }
            })
        );

        // Remove event recipients from database
        [err, event] = await to(
            eventRecipients.destroy({
                where: {
                    event_id: event_id
                }
            })
        );

        [err, event] = await to(
            Notification.destroy({
                where: {
                    target_event_id: event_id,
                    $or: [{
                            type: "EVENT",
                        },
                        {
                            type: "EVENT_ACCEPT",
                        },
                        {
                            type: "EVENT_REJECT",
                        },
                        {
                            type: "EVENT_MAY_BE",
                        }
                    ]
                }
            })
        );

        if (err) {
            return ReE(res, { success: false, message: err }, 401);
        }

        await sendDeleteEmail(events[0]);
    } else {
        [err, event] = await to(
            deletedEvents.create({
                event_id: event_id,
                delete_date: req.body.start
            })
        );
    }
    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, {
        event: event_id
    }, 200);
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description Fetch single vent by event id
 * @returns undefined
 */
const getSingleEvent = async function(req, res) {
    let err, event;
    if (req.params.id) {
        var events = await getEventById(req.params.id);
        // events[0].startEnd = moment(events[0].start).utc().format("YYYY-MM-DDTHH:mm:ss");
        // events[0].startTime = moment(events[0].start).utc().format("YYYY-MM-DDTHH:mm:ss");
        // events[0].endTime = moment(events[0].end).utc().format("YYYY-MM-DDTHH:mm:ss");
        return ReS(res, {
            event: events[0]
        }, 200);
    }
};

/**
 * 
 * @param {Object} event 
 * @description Send invitees email after delete event
 * @returns undefined
 */
const sendDeleteEmail = async function(event) {
    let parms = {};
    let subject = getSubject(event);
    let timeTitle = getEventTimeTitle(event);
    for (var i = 0; i < event.contact_id.length; i++) {
        if (event.contact_id[i].email != 'No email address' && !event.contact_id[i].fixed) {
            let templateText = await template.getDeleteEventEmailTemplate(timeTitle, event.start, event.end, event.title, event.contact_id, event.details, event.location);
            smtpTransport.sendMail({
                from: 'no-reply@ripplecrm.com',
                to: event.contact_id[i].email,
                subject: "This event has been cancelled : " + subject,
                html: templateText
            }, function(err) {
                if (err) {
                    parms.message = 'Error in email sending';
                    parms.error = {
                        status: `Invalid_Request: ${err}.`
                    };
                    console.log(JSON.stringify(parms))
                }
            });

        }
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description Fetch event count by event type
 * @returns undefined
 */
const getEventCounts = async function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    let user = req.user;
    let err, eventCount, eventCountObject = {};

    [err, eventCount] = await to(
        Events.count({
            where: {
                user_id: user.id,
                type: "meeting"
            }
        })
    );
    if (err) {
        return ReE(res, err, 422);
    }
    eventCountObject["meeting"] = eventCount;
    [err, eventCount] = await to(
        Events.count({
            where: {
                user_id: user.id,
                type: "annualLeave"
            }
        })
    );
    if (err) {
        return ReE(res, err, 422);
    }
    eventCountObject["annualLeave"] = eventCount;
    [err, eventCount] = await to(
        Events.count({
            where: {
                user_id: user.id,
                type: "personal"
            }
        })
    );
    if (err) {
        return ReE(res, err, 422);
    }
    eventCountObject["personal"] = eventCount;
    return ReS(res, {
        eventCount: eventCountObject
    }, 200);
};

/**
 * 
 * @param {Object} event 
 * @description Fetch event subject for email  
 * @returns {String}
 */
const getSubject = event => {
    let orgEmail;
    for (var i = 0; i < event.contact_id.length; i++) {
        if (event.contact_id[i].fixed) {
            orgEmail = event.contact_id[i].email;
            break;
        }
    }
    if (event.is_all_day) {
        let endDate = event.is_end ? moment(event.end).format('dddd, MMMM Do YYYY') : '';
        return `Event Invite: ${event.title} @ ${moment(event.start).format('dddd, MMMM Do YYYY')} - ${endDate} All Day ${orgEmail}`
    } else {
        let endTimeMessage = event.is_end ? moment(event.end).format('dddd, MMMM Do YYYY') : '';
        if (event.is_end_time) {
            endTimeMessage = endTimeMessage + ' ' + moment(event.endTime).format('HH:mm');
        }
        return `Event Invite: ${event.title} @ ${moment(event.start).format('dddd, MMMM Do YYYY HH:mm')} - ${endTimeMessage} ${orgEmail}`
    }
}

/**
 * 
 * @param {Object} event 
 * @description Generate event title for email
 * @returns {String}
 */
const getEventTimeTitle = event => {
    for (var i = 0; i < event.contact_id.length; i++) {
        if (event.contact_id[i].fixed) {
            orgEmail = event.contact_id[i].email;
            break;
        }
    }
    if (event.is_all_day) {
        let endDate = event.is_end ? moment(event.end).format('dddd, MMMM Do YYYY') : '';
        return `${moment(event.start).format('dddd, MMMM Do YYYY')} - ${endDate} All Day `
    } else {
        let endTimeMessage = event.is_end ? moment(event.end).format('dddd, MMMM Do YYYY') : '';
        if (event.is_end_time) {
            endTimeMessage = endTimeMessage + ' ' + moment(event.endTime).format('HH:mm');
        }
        return `${moment(event.start).format('dddd, MMMM Do YYYY HH:mm')} - ${endTimeMessage}`
    }
}

/**
 * 
 * @param {Number} event_id 
 * @description Fetch single event details by event id.
 * @returns {Array} event
 */
const getEventById = async function(event_id) {
    var err, event;
    var events = [];
    [err, event] = await to(
        Events.findAll({
            where: {
                id: event_id
            }
        })
    );
    for (var i = 0; i < event.length; i++) {
        var data = {
            startTime: event[i].start,
            endTime: event[i].end,
            is_end: event[i].is_end,
            is_end_time: event[i].is_end_time,
            color: event[i].color,
            created_at: event[i].created_at,
            details: event[i].details,
            end: event[i].end,
            id: event[i].id,
            is_send_email: event[i].is_send_email,
            startEnd: event[i].start,
            is_all_day: event[i].is_all_day,
            location: event[i].location,
            meeting_room_id: event[i].meeting_room_id,
            start: event[i].start,
            text_reminder: event[i].text_reminder,
            title: event[i].title,
            type: event[i].type,
            updated_at: event[i].updated_at,
            user_id: event[i].user_id,
            contact_id: await getEventContacts(event[i].id, event[i].user_id, event[i].is_send_email),
            is_meeting_room: event[i].is_meeting_room,
            repeat: await repeatHelper.getRepeatDetails(event[i].id, 'event'),
            endrepeat: await repeatHelper.getEndRepeatDetails(event[i].id, 'event'),
            dayDiff: moment(event[i].end).diff(moment(event[i].start), 'days'),
            deletedDay: await getEventDeletedDays(event[i].id)
        };
        events.push(data);
    }
    return events;
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description Resend email to perticular invitee.
 * @returns undefined
 */
const resendEmail = async function(req, res) {
    if (req.body.is_send_email) {
        let recpId = await getUserInvitationId(req.body.email, req.body.id);
        let key = md5(recpId);
        for (let i = 0; i < req.body.contact_id.length; i++) {
            req.body.contact_id[i].key = key;
            if (req.body.contact_id[i].status == 'Y') {
                req.body.contact_id[i].message = 'Attending';
            } else if (req.body.contact_id[i].status == "N" && !req.body.contact_id[i].fixed) {
                req.body.contact_id[i].message = 'Not Attending';
            } else if (req.body.contact_id[i].status == "T" && !req.body.contact_id[i].fixed) {
                req.body.contact_id[i].message = 'Possibly Attending';
            }
            if (req.body.contact_id[i].email != req.body.email) {
                req.body.contact_id[i].fixed = true;
            }
        }
        let err, user;
        [err, user] = await to(
            inviteEvents.update({ key: key }, {
                where: {
                    event_recipients_id: recpId,
                    event_id: req.body.id
                }
            })
        );
        if (err) {
            return ReE(res, err, 422);
        }
        await sendInviteEmails(req.body);
    }
    return ReS(res, {
        success: true,
        message: "Resend invitation successfully sent."
    }, 200);
}

/**
 * 
 * @param {String} email 
 * @param {Number} eventId
 * @description Fetch invitation id by email and event id
 * @return {Number}
 */

async function getUserInvitationId(email, eventId) {
    let err, user;
    [err, user] = await to(eventRecipients.findOne({
        where: {
            event_id: eventId,
            email: email
        }
    }));
    if (err) {
        console.log("Errrr->", err);
    }
    return user ? user.id : null;
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description Check meeting room avaibility by meeting room id.
 * @returns undefined
 */
const isMeetingRoomAvailable = async function(req, res) {

    let err, meetings;
    let meetingDetails = "Booked by ";
    if (!req.body.end) {
        return ReE(res, {
            success: false,
            message: "End date time is required."
        }, 200);
    }

    [err, meetings] = await to(
        Events.sequelize.query(
            `SELECT user_id, start , end FROM events AS e WHERE e.meeting_room_id = '${req.body.meeting_room_id}' AND
 e.id <> '${req.body.event_id ? req.body.event_id : 0}'
 AND (
     ((e.start  between '${req.body.start}' and '${req.body.end}' ) OR (e.end  between '${req.body.start}' and '${req.body.end}'))
     OR (
        ('${req.body.start}' between e.start AND e.end) OR ('${req.body.end}' between e.start AND e.end)
     )
  )`
        )
    );
    if (err) {
        return ReE(res, err, 422);
    }
    if (meetings[0].length > 0) {
        meetings = meetings[0];
        for (let i = 0; i < meetings.length; i++) {
            if (req.user.id === meetings[i].user_id) {
                if (meetings.length > 1 && i > 0 && i != meetings.length - 1) {
                    meetingDetails += ', ' + user
                } else if (meetings.length > 1 && i > 0 && i == meetings.length - 1) {
                    meetingDetails += ' and ' + 'You'
                } else {
                    meetingDetails += ' ' + 'You '
                }
            } else {
                var user = await getUsersDetails(meetings[i].user_id);
                if (meetings.length > 1 && i > 0 && i != meetings.length - 1) {
                    meetingDetails += ', ' + user
                } else if (meetings.length > 1 && i > 0 && i == meetings.length - 1) {
                    meetingDetails += ' and ' + user
                } else {
                    meetingDetails += ' ' + user
                }
            }

        }
        return ReE(res, {
            time: meetings[0],
            msg: meetingDetails,
            success: false
        }, 200);
    } else {
        let bookedUsers = await checkRepeatedEvents(req.body, req.user.id);
        if (bookedUsers.length === 0) {

            return ReS(res, {
                success: true,
                message: "Meeting room is available"
            }, 200)
        } else {

            return ReE(res, {
                success: false,
                bookedUsers: bookedUsers,
                message: "Booked by " + getArrangedUserName(bookedUsers)
            }, 200)
        }

    }
}


const getArrangedUserName = (bookedUsers) => {
    let nameString = '';
    for (let i = 0; i < bookedUsers.length; i++) {
        nameString += bookedUsers[i];

        if (i == bookedUsers.length - 2) {
            nameString += " And ";
        } else {
            nameString += ', ';
        }

    }
    return nameString;
}

const checkRepeatedEvents = async(event, user_id) => {
    let repeatedEvents = [];
    let savedRepeatedEvent = [];
    let alreadySavedEvents = await getRepeatedSavedEvents(event.meeting_room_id, event.event_id);
    let start = event.start;
    let isCheck = false;
    const userId = user_id;
    let bookedUsers = [];
    if (event.endrepeat.endrepeatVal == "none") {
        isCheck = true;
    }
    for (let i = 0; i < 12; i++) {
        start = moment(event.start).add(i, "months").format();
        if (event.repeat.repeatVal !== "none") {
            repeatedEvents = await repeatedEvents.concat(await repeatHelper.getRepeats(start, Object.assign({}, event)));
        } else {
            repeatedEvents.push(event);
        }
        for (let j = 0; j < alreadySavedEvents.length; j++) {
            if (alreadySavedEvents[j].repeat.repeatVal != "none") {
                savedRepeatedEvent = await savedRepeatedEvent.concat(await repeatHelper.getRepeats(start, Object.assign({}, alreadySavedEvents[j])));
            } else {
                savedRepeatedEvent = savedRepeatedEvent.concat(alreadySavedEvents);
            }
        }
    }
    repeatedEvents = await repeatHelper.filterEventsByEndDateAndDeletedDays(repeatedEvents, isCheck);
    savedRepeatedEvent = await repeatHelper.filterEventsByEndDateAndDeletedDays(savedRepeatedEvent);
    for (let i = 0; i < repeatedEvents.length; i++) {
        for (let j = 0; j < savedRepeatedEvent.length; j++) {
            let s = moment(repeatedEvents[i].start).format();
            let e = moment(repeatedEvents[i].end).format();
            let ss = moment(savedRepeatedEvent[j].start).format();
            let se = moment(savedRepeatedEvent[j].end).format();
            let reStartMoment = new Date(s);
            let reEndMoment = new Date(e);
            let saStartMoment = new Date(ss);
            let saEndMoment = new Date(se);
            if (
                (reStartMoment >= saStartMoment && reEndMoment <= saEndMoment) ||
                (reStartMoment >= saStartMoment && reStartMoment <= saEndMoment) ||
                (reStartMoment <= saStartMoment && reEndMoment >= saEndMoment) ||
                (saStartMoment <= reStartMoment && saEndMoment >= reEndMoment) ||
                (saStartMoment >= reStartMoment && saStartMoment <= reEndMoment && saEndMoment >= reEndMoment)
            ) {
                for (let k = 0; k < savedRepeatedEvent[j].contact_id.length; k++) {
                    if (savedRepeatedEvent[j].contact_id[k].fixed) {
                        let name = '';
                        if (userId == savedRepeatedEvent[j].contact_id[k].id) {
                            name = "You"
                        } else {
                            name = savedRepeatedEvent[j].contact_id[k].first_name + ' ' + savedRepeatedEvent[j].contact_id[k].last_name;
                        }
                        if (bookedUsers.indexOf(name) == -1) {
                            bookedUsers.push(name);
                        }
                    }
                }
            }
        }
    }
    return bookedUsers;
}

const getRepeatedSavedEvents = async(meetingRoomId, eventId) => {
    let err, event;
    let events = [];
    [err, event] = await to(
        Events.sequelize.query(
            `SELECT e.* from events as e 
            INNER JOIN event_repeats r 
            ON r.event_id = e.id 
            WHERE
            e.meeting_room_id = ${meetingRoomId} AND e.id <> ${eventId ? eventId : 0}`
        )
    );
    if (event) {
        event = event[0];
    }
    for (var i = 0; i < event.length; i++) {
        let data = {
            base: "main",
            startTime: event[i].start,
            endTime: event[i].end,
            end: event[i].end,
            id: event[i].id,
            is_send_email: event[i].is_send_email,
            startEnd: event[i].start,
            location: event[i].location,
            meeting_room_id: event[i].meeting_room_id,
            start: event[i].start,
            user_id: event[i].user_id,
            is_meeting_room: event[i].is_meeting_room,
            repeat: await repeatHelper.getRepeatDetails(event[i].id, 'event'),
            endrepeat: await repeatHelper.getEndRepeatDetails(event[i].id, 'event'),
            dayDiff: moment(event[i].end).diff(moment(event[i].start), 'days'),
            deletedDay: await getEventDeletedDays(event[i].id),
            contact_id: await getEventContacts(event[i].id, event[i].user_id, event[i].is_send_email)
        };
        events.push(data);
    }
    return events;
}

/**
 * 
 * @param {Number} user_id 
 * @description Fetch user details by user id.
 * @returns {Array} user
 */
const getUsersDetails = async function(user_id) {
    let err, user;
    [err, user] = await to(
        usersModel.findAll({
            attributes: ['first_name', 'last_name'],
            where: {
                id: user_id
            }
        })
    );
    if (err) {
        return console.log("Error in fetch users", err);
    }
    return user[0].first_name + ' ' + user[0].last_name;
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description for set invitees status for event according to invitees action
 * @returns undefined
 */
const acceptRejectInvitation = async function(req, res) {
    let event = req.body;
    if (!event) {
        return ReE(res, "No event status", 422);
    }
    let event_id = await getEventIdByTitle(event.title);
    let invId = await getUserInvitationIds(event.email, event_id);
    await updateStatus(invId, event_id, event);
    let eventDetails = await getEventById(event_id);
    await sendOrgenizerEmail(eventDetails[0], event.email, event.status);
    return ReS(res, {
        success: true,
        message: "Updated event status"
    }, 200);
}

/**
 * 
 * @param {String} title 
 * @description Fetch event id by event title
 * @returns {Number} event.id
 */
const getEventIdByTitle = async function(title) {
    let err, event;
    [err, event] = await to(Events.findOne({
        where: {
            title: title
        }
    }));
    return event.id;
}

/**
 * 
 * @param {String} email 
 * @param {Number} event_id 
 * @description Fetch invitees invitation id by email and event id.
 * @returns {Number} invitation.id
 */
const getUserInvitationIds = async function(email, event_id) {
    let err, invitation;
    [err, invitation] = await to(eventRecipients.findOne({
        where: {
            email: email,
            event_id: event_id
        }
    }));
    return invitation ? invitation.id : 1;
}

/**
 * 
 * @param {Number} invId 
 * @param {Number} event_id 
 * @param {Object} event 
 * @description Update invitees status for event by event id.
 * @returns {Array} invites
 */
const updateStatus = async function(invId, event_id, event) {
    let err, invites;
    [err, invites] = await to(inviteEvents.update({
        status: event.status,
        message: !event.status ? event.message : ""
    }, {
        where: {
            event_recipients_id: invId,
            event_id: event_id
        }
    }));
    if (err) {
        return console.log("!!!!!!!!", err);
    }
    return invites;
}

/**
 * 
 * @param {Object} event 
 * @param {Object} user 
 * @param {Boolean} is 
 * @description Send email to orgenizer after update invitation status
 * @returns {Boolean}
 */
const sendOrgenizerEmail = async function(event, user, is, rmessage) {
    let parms = {};;
    let subject = await getSubject(event);
    let timeTitle = await getEventTimeTitle(event);

    for (var i = 0; i < event.contact_id.length; i++) {
        if (event.contact_id[i].email != 'No email address' && event.contact_id[i].fixed) {
            let templateText = await template.orgenizerTemplate(timeTitle, event.start, event.end, event.title, event.contact_id, event.details, event.location, user, is, rmessage);
            await smtpTransport.sendMail({
                from: 'no-reply@ripplecrm.com',
                to: event.contact_id[i].email,
                subject: subject,
                html: templateText
            }, function(err) {
                if (err) {
                    parms.message = 'Error in email sending';
                    parms.error = {
                        status: `Invalid_Request: ${err}.`
                    };
                    console.log(JSON.stringify(parms))
                    return false;
                }
                console.log("---------------------------Complete process--------------------");
                return true;
            });
        }
    }
}

const getEventByKey = async function(req, res) {
    let key = req.body.key;
    let err, eventRecipient;
    [err, eventRecipient] = await getEventIdAndRecipientsIdByKey(key);
    if (err) {
        return ReE(res, "No event status", 422);
    }
    if (!eventRecipient.event_recipients_id) {
        return ReE(res, "This is dead link", 422);
    }
    var events = await getEventById(eventRecipient.event_id);
    return ReS(res, {
        success: true,
        data: {
            events: events,
            event_recipients_id: eventRecipient.event_recipients_id,
            eventRecipient,
            ics: await getICSFile(events[0])
        },
    }, 200);

}

const getEventIdAndRecipientsIdByKey = async(key) => {
    let err, result;
    [err, result] = await to(
        inviteEvents.findOne({
            attributes: ['event_id', 'event_recipients_id', 'reminder_date'],
            where: {
                key: key
            }
        })
    )
    return [err, result];
}

const updateStatusRoute = async(req, res) => {
    await updateStatusAfterChange(req.body.event_recipients_id, req.body.event_id, req.body.status, req.body.message);
    let eventDetails = await getEventById(req.body.event_id);
    let type = '';
    if (req.body.status == 'Y') {
        type = "EVENT_ACCEPT"
    } else if (req.body.status == 'N') {
        type = "EVENT_REJECT"
    } else {
        type = "EVENT_MAY_BE"
    }
    let notificationEvent = {};
    if (eventDetails && eventDetails.length > 0) {
        notificationEvent = eventDetails[0];
    }
    let currentDate = new Date();
    currentDate.setSeconds(0);
    notificationEvent.start = currentDate;
    notificationEvent.recipients_id = req.body.event_recipients_id;
    notificationEvent.reminder = -1;

    let [err, notification] = await commonFunction.insertNotification(notificationEvent, type);
    if (err) {
        return ReE(res, "No event status", 422);
    }
    await sendOrgenizerEmail(eventDetails[0], req.body.email, req.body.status, req.body.message);
    return ReS(res, {
        success: true,
        message: "Updated event status"
    }, 200);
}

/**
 * 
 * @param {Number} invId 
 * @param {Number} event_id 
 * @param {Object} event 
 * @description Update invitees status for event by event id.
 * @returns {Array} invites
 */
const updateStatusAfterChange = async function(invId, event_id, status, message) {
    let err, invites;
    [err, invites] = await to(inviteEvents.update({
        status: status,
        message: message
    }, {
        where: {
            event_recipients_id: invId,
            event_id: event_id
        }
    }));
    if (err) {
        return console.log("!!!!!!!!", err);
    }
    return invites;
}

const getICSFile = async function(event) {
    if (!event) return '';
    let attendees = [];
    event.end = event.end || moment(event.start).hour(moment(event.endTime)).minute(event.endTime);
    let startDate = event.start;
    let endDate;
    if (event.end) {
        endDate = event.end;
    } else {
        endDate = startDate;
    }
    for (var i = 0; i < event.contact_id.length; i++) {
        if (event.contact_id[i].fixed) {
            orgUser = event.contact_id[i].first_name + ' ' + event.contact_id[i].last_name;
            orgEmail = event.contact_id[i].email;
            break;
        }
    }
    for (var i = 0; i < event.contact_id.length; i++) {
        if (!event.contact_id[i].fixed) {
            attendees.push({
                name: event.contact_id[i].first_name + ' ' + event.contact_id[i].last_name ? event.contact_id[i].last_name : '',
                role: 'REQ-PARTICIPANT',
                rsvp: true,
                status: 'NEEDS-ACTION',
                type: 'INDIVIDUAL',
                email: event.contact_id[i].email
            });
        }
    }
    var calIns = ical({
        domain: 'ripplecrm.com',
        prodId: '//ripplecrm.com//ical//EN',
        method: 'request',
        UID: event.id,
        CALSCALE: 'GREGORIAN',
        events: [{
            sequence: 2,
            start: startDate,
            end: endDate,
            timestamp: startDate,
            summary: event.title,
            description: event.details,
            location: event.location,
            status: 'CONFIRMED',
            "X-MICROSOFT-CDO-IMPORTANCE": 1,
            //X-MICROSOFT-CDO-OWNERAPPTID:1518324001
            organizer: {
                name: orgUser,
                email: orgEmail,
                mailto: 'hello@ripplecrm.co.uk'
            },
            attendees: attendees,
        }]
    }).toString();
    return calIns;
}

const getEventInvitesByEventIds = async(req, res) => {
    let events = req.body;
    let err, invites;
    [err, invites] = await to(inviteEvents.findAll({
        where: {
            event_recipients_id: events
        }
    }));
    if (err) {
        return ReE(res, "No event status", 422);
    }
    return ReS(res, {
        success: true,
        invites: invites
    }, 200);
}


/** 
 * @author Gaurav V 
 * @function setInvitationReminder 
 * @param {*} req  
 * @param {*} res  
 * @description this function set remider date in invitation 
 * @return {Object} res; 
 */

async function setInvitationReminder(req, res) {
    const { reminder, event_id, event_recipients_id } = req.body;
    let [err, { start, user_id }] = await to(Events.findByPk(event_id));

    if (!start || err) {
        return ReE(res, err, 422);
    };
    const reminderDate = new Date((Date.parse(start) - reminder * 60 * 1000));

    [err, invites] = await to(inviteEvents.update({
        reminder_date: reminderDate || start
    }, {
        where: {
            event_recipients_id: event_recipients_id,
            event_id: event_id
        }
    }));
    if (err) {
        return ReE(res, err, 422);
    }
    return ReE(res, {
        success: true,
        message: "Reminder set successfully"
    }, 201);
};

const getUserTimezoneByUserId = async(user_id) => {
    let sql = `SELECT  
    timezones.id as timezone_id, 
    timezones.key, 
    timezones.value 
    FROM users INNER join accounts ON users.account_id = accounts.id  
    INNER JOIN timezones on timezones.id = accounts.timezone_id  
    WHERE users.id = ${user_id}`;
    const [err, timeZone] = await to(
        usersModel
        .sequelize
        .query(
            sql
        )
    );

    return [err, timeZone[0][0]];
}


module.exports.create = create;
module.exports.getContactsOnChange = getContactsOnChange;
module.exports.getContacts = getContacts;
module.exports.update = update;
module.exports.getSingleEvent = getSingleEvent;
module.exports.getEventCounts = getEventCounts;
module.exports.resendEmail = resendEmail;
module.exports.isMeetingRoomAvailable = isMeetingRoomAvailable;
module.exports.getAll = getAll;
module.exports.remove = remove;
module.exports.acceptRejectInvitation = acceptRejectInvitation;
module.exports.getEventByKey = getEventByKey;
module.exports.updateStatusRoute = updateStatusRoute;
module.exports.getEventInvitesByEventIds = getEventInvitesByEventIds;
module.exports.setInvitationReminder = setInvitationReminder;
module.exports.getEventContacts = getEventContacts;