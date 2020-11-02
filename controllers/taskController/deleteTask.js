const Task = require('../../models').tasks;
const CallOutcomesTransition = require('../../models').call_outcomes_transitions;
const History = require('../../models').histories;
const Notification = require('../../models').notifications;

const remove = async function (req, res) {

    let err, taskId, transitionBody;
    
    taskId = req.body.id;
    console.log("taskId ==========================================================================++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++",taskId);
    
    let transition_id_array = [];

    [err , updateId] = await to(Task.findAll({
        where:{
            id: taskId,
            call_list_id:{$not:null}
        },
        attributes: ['id','call_list_id']
    }));
    if(err){
        return ReE(res, { success: false, message: err }, 401);
    }
    [err , deleteId] = await to(Task.findAll({
        where:{
            id: taskId,
            call_list_id:null
        },
        attributes: ['id','call_list_id']
    }));
    if(err){
        return ReE(res, { success: false, message: err }, 401);
    }
    
    let { delId , uptId } = await getId(updateId, deleteId);
    
    [err, transitionBody] = await to(CallOutcomesTransition.findAll({
        where: {
            task_id: delId
        }
    }));
    
    await transitionBody.forEach(element => {
        transition_id_array.push(element.id)
    });

    [err, task] = await to(
        CallOutcomesTransition.destroy({
            where: {
                task_id: delId
            }
        })
        );
    if (err) {
        return ReE(res, { success: false, message: err }, 401);
    }

    [err, task] = await to(
        History.destroy({
            where: { 
                $and:[
                    {
                        entity_id: transition_id_array 
                    },
                    {
                        entity_type: "OUTCOME_TRANSITION"
                    }
                ]
            }
        })
        );
    if (err) {
        return ReE(res, { success: false, message: err }, 401);
    }

    [err, task] = await to(
        Notification.destroy({
            where: { 
                $and:[
                    {
                        target_event_id: delId 
                    },
                    {
                        type: "CALL"
                    }
                ]
            }
        })
        );
    if (err) {
         return ReE(res, { success: false, message: err }, 401);
    }

    [err, task] = await to(
        Task.destroy({
            where: { id: delId,
                call_list_id:  null
             }
        })
        );
    if (err) {
        return ReE(res, { success: false, message: err }, 401);
    }
    let data = {
        start: null,
        end: null
    };
    [err, task] = await to(  
        Task.update(data, {
            where: {
                id: {
                    $in: uptId
                },
                call_list_id:{ $not: null}
            }
        })
    );
    if (err) {
        return ReE(res, { success: false, message: err }, 401);
    } 

    return ReS(res, { success: true, message:'Task deleted successfully.' }, 200);
}

const getId = async(updateId, deleteId) =>{
    let updatedId =[], deletedId = [];
   
        for(let element of updateId){
                 updatedId.push(element.id);
        }
        for(let element of deleteId){
            deletedId.push(element.id);
        }
   
    return {delId: deletedId , uptId:updatedId }
}
module.exports.remove = remove;
