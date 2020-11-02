const Task = require('../../models').tasks;
const commonFunction = require('../../services/commonFunction');
const Contacts = require('../../models').contacts;
const LeadClient = require('../../models').leads_clients;

const getTaskCount = async function(req, res) {

    let overdueTasks, futureTasks, todayTasks;

    const { overdueDate, futureDate, todayStart, todayEnd } = req.body.clientDates

    let user_id = [req.user.id];

    if (req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }

    try {
        [err, allTasks] = await to(
            Task.count({
                where: {
                    user_id: {
                        $in: user_id
                    },
                    task_type: "CALL",
                    start: { $not: null}
                },
                 include: [{
                    model: Contacts,
                    as: 'contact',
                    include: [{
                        model: LeadClient,
                        as: "lead_client",
                        where: {
                            owner : user_id
                        },
                        required: true,
                    }],
                    required: true
                }]
            })
        );
        if (err) {
            return ReE(res, err);
        }
    } catch (err) {
        return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
    }

    try {
        [err, overdueTasks] = await to(
            Task.count({
                where: {
                    is_completed: 0,
                    user_id: {
                        $in: user_id
                    },
                    task_type: "CALL",
                    start: {
                        $lt: overdueDate,
                    }
                },
                include: [{
                   model: Contacts,
                   as: 'contact',
                   include: [{
                       model: LeadClient,
                       as: "lead_client",
                       where: {
                           owner : user_id
                       },
                       required: true,
                   }],
                   required: true
               }]
            })
        );
        if (err) {
            return ReE(res, err);
        }
    } catch (err) {
        return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
    }

    try {
        [err, todayTasks] = await to(
            Task.count({
                where: {
                    is_completed: 0,
                    user_id: {
                        $in: user_id
                    },
                    task_type: "CALL",
                    start: {
                        $between: [todayStart, todayEnd]
                    }
                },
                include: [{
                   model: Contacts,
                   as: 'contact',
                   include: [{
                       model: LeadClient,
                       as: "lead_client",
                       where: {
                           owner : user_id
                       },
                       required: true,
                   }],
                   required: true
               }]
            })
        );
        if (err) {
            return ReE(res, err);
        }
    } catch (err) {
        return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
    }

    try {
        [err, futureTasks] = await to(
            Task.count({
                where: {
                    is_completed: 0,
                    user_id: {
                        $in: user_id
                    },
                    task_type: "CALL",
                    start: {
                        $gt: futureDate,
                    }
                },
                include: [{
                   model: Contacts,
                   as: 'contact',
                   include: [{
                       model: LeadClient,
                       as: "lead_client",
                       where: {
                           owner : user_id
                       },
                       required: true,
                   }],
                   required: true
               }]
            })
        );
        if (err) {
            return ReE(res, err);
        }
    } catch (err) {
        return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
    }

    let total_count = {
        all: allTasks,
        overdue: overdueTasks,
        today: todayTasks,
        future: futureTasks
    };

    return ReS(res, { task: total_count });
}
module.exports.getTaskCount = getTaskCount;