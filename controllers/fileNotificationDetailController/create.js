const DB = require('../../models'); 
const FileNotificationDetail = DB.file_notification_details;
const path = require('path');

/**
 * Create file notification detail object from request data
 * @param req request object
 * @param res response object
 */
const create = async function(req, res){
    
    let err, notificationObject;
    notificationObject = req.body;
    notificationObject.user_id = req.user.id;

    if (!notificationObject.entity_type || !notificationObject.entity_id) {
        return ReE(res, { success: false, message: 'It should have entity.' }, 401);
    }

    [err, notificationObject] = await to(FileNotificationDetail.create(notificationObject));
    
    if(err) 
        return ReE(res, err, 422);

    notificationObject.dataValues['extension'] = path.extname(notificationObject.file_name);

    return ReS( res, {
        notification_detail : notificationObject,
        message : 'File notification detail created successfully.'
    }, 200);   
} 

module.exports = create;