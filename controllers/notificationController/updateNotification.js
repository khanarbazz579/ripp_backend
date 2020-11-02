const Notification = require('../../models').notifications;
const Task = require('../../models').tasks;
const Event = require('../../models').events;
const Contact = require('../../models').contacts;
const LeadClient = require('../../models').leads_clients;
const Company = require('../../models').companies;
const Todo = require('../../models').todos;
const Category = require('../../models').categories;
const EventRecipient = require('../../models').event_recipients;
const TodoContact = require('../../models').todo_contacts;

const Sequelize = require('sequelize');

//Update a notification object
const update = async function(req, res){

    let err, notification, notificationBody, notificationId, notificationsReadStatus;

    if (isNaN(parseInt(req.params.id))) {
        return ReE(res, { success: false, message: 'It should have requested id.' }, 401);
    }

    notificationId = req.params.id;
    notificationBody = req.body;

    [err, notification] = await to(
        Notification.update(notificationBody,{
            where: {
                id: notificationId
            }
        })
    );  

    if (err) {
        return ReE(res, err, 422);
    }

    [err, notificationsReadStatus] = await to(
        Notification.findAll(
            {
                where: {
                    user_id: req.user.id,                    
                    is_read: 0
                }
            }
        )
    );  

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, { 
        notification: notification, 
        notificationsReadStatus : notificationsReadStatus.length ? true : false, 
        message: 'Notification updated successfully.' });
}
module.exports.update = update;
