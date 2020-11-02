const Task = require('../../models').tasks;
const Contact = require('../../models').contacts;
const commonFunction = require('../../services/commonFunction');

const update = async function (req, res) {
    let err, task, task_id, task_body;

    if (isNaN(parseInt(req.params.task_id))) {
        return ReE(res, { success: false, message: 'It should have requested task id.' }, 401);
    }

    task_id = req.params.task_id;
    task_body = req.body;

    [err, task] = await to(
        Task.findByPk(task_id, {
            include: [{
                model: Contact,
                as: "contact"
            }],
        })
    );
    if (err) {
        return ReE(res, err, 422);
    }
    if(task){

        if (task.reminder != task_body.reminder ) { 
            task["reminder"] = task_body.reminder; 
            let [err, notification] = await commonFunction.updateNotification(task, "CALL");  
            if (err) {
                return ReE(res, err, 422);
            }            
        }
 
        [err, task] = await to(
            task.update(task_body, {
                include: [{
                    model: Contact,
                    as: "contact"
                }],
            })
        );

        if (err) {
            return ReE(res, err, 422);
        }
        return ReS(res, { task: task, message: 'Task updated successfully.' });
    }else{
        return ReE(res, { success: false, message: 'No record found'}, 401);
    }
}
module.exports.update = update;
