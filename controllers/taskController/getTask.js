const Task = require('../../models').tasks;

const get = async function (req, res) {
    let task, err, taskId;

    if (isNaN(parseInt(req.params.task_id))) {
        return ReE(res, { success: false, message: 'It should have requested task id.' }, 401);
    }

    taskId = req.params.task_id;

    try {
        [err, task] = await to(
            Task.findByPk(taskId)
        );
        if (err) {
            return ReE(res, err);
        }
        return ReS(res, { task: task });
    } catch (err) {
        return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
    }
}
module.exports.get = get;
