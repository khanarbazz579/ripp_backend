const Notification = require('../../models').notifications;
const FileNotification = require('../../models').file_notification_details;

/**
 * Get all notification which is not readed yet
 */
const notificationReadStatus = async function(req,res) {
    let err, notifications = [], fileNotifications = [];

    let mainNotifications = isActivityNotifications = isFileNotifications = false;

    [err, notifications] = await to(
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

    [err, fileNotifications] = await to(
        FileNotification.findAll(
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

    if(notifications.length){
        mainNotifications = true;
        isActivityNotifications = true;
    }

    if(fileNotifications.length){
        mainNotifications = true;
        isFileNotifications = true;
    }

    return ReS(res, { 
        notifications: mainNotifications,
        activityNotifications: isActivityNotifications,
        fileNotifications: isFileNotifications
    }); 
}

module.exports.notificationReadStatus = notificationReadStatus;