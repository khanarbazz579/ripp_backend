const Task = require('../../models').tasks;

const bulkUpdate = async function (req, res) {

    let err, task;
    let multipleTaskId = [];
    
    if ((req.body.type == "rescheduleToday" || req.body.type == "rescheduleTomorrow")) {
        multipleTaskId = req.body.id;
        type = req.body.type;
            let data = {};
            if (type == "rescheduleToday") {
                data = { start: new Date() }
            } else if (type == "rescheduleTomorrow") {
                let tomorrowDate = new Date();
                tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                data = { start: tomorrowDate }
            }

            [err, task] = await to(
                Task.update(data, {
                    where: {
                        id: {
                            $in: multipleTaskId
                        }
                    }
                })
            );
            if (err) {
                return ReE(res, err);
            }
            return ReS(res, { task: task });
        // }
    } else {
        return ReE(res, { success: false, message: "It should have valid type." }, 422);
    }
}


module.exports.bulkUpdate = bulkUpdate;
