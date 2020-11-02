const DB = require('../../models'); 
const FileNotificationDetail = DB.file_notification_details;

/**
 * Get file notification read status
 * @param req request object
 * @param res response object
 */
 const getFileNotificationReadStatus = async function(req, res){

    let err, notificationsReadStatus;

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
        notificationsReadStatus : notificationsReadStatus.length ? true : false, 
        message: 'File notification read status get successfully.' 
    });
}
module.exports = getFileNotificationReadStatus;