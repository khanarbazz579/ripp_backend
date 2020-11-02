const DB = require('../../models'); 
const FileNotificationDetail = DB.file_notification_details;

/**
 * Update existing file notification detail object from request data
 * @param req request object
 * @param res response object
 */
 const update = async function(req, res){

    let err, notification, notificationBody, notificationId, notificationsReadStatus;

    notificationId = req.params.id;
    notificationBody = req.body;

    if (!notificationBody.entity_type || !notificationBody.entity_id) {
        return ReE(res, { success: false, message: 'It should have entity.' }, 401);
    }

    [err, notification] = await to(
        FileNotificationDetail.update(notificationBody,{
            where: {
                id: notificationId
            }
        })
    );  

    if (err) {
        return ReE(res, err, 422);
    }

    [err, notificationsReadStatus] = await to(
        FileNotificationDetail.findAll(
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
        message: 'File notification updated successfully.' 
    });
}
module.exports = update;