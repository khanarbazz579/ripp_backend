const Task = require('../../models').tasks;
const Notification = require('../../models').notifications;
const commonFunction = require('../../services/commonFunction');

//Created a task object
const create = async function (req, res) {

    const taskBody = req.body;

    if (!taskBody.contact_id) {
        return ReE(res, { success: false, message: 'Contact is required.' }, 401);
    }

    let err, task, notification, notificationBody;

    taskBody.user_id = req.user.id;    

    [err, task] = await to(Task.create(taskBody));
    
    if(err){
        return res.json({ success: false, message: err })
    }else{
        
        if (taskBody.reminder != undefined) { 
            task["reminder"] = taskBody.reminder; 
            let [err, notification] = await commonFunction.insertNotification(task, "CALL");  
            if (err) {
                return ReE(res, err, 422);
            }            
        }
    }

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, { task: task, message: 'Task created successfully.' }, 200);
}
module.exports.create = create;