const CallOutcomeTransition = require('../../models').call_outcomes_transitions;
const History = require('../../models').histories;


//Create a call outcome object
const create = async function(req, res){
    
    let err, outcomeTransitionObject, history, historyBody, status, taskId;
    let transitionObject = []; 
    
    outcomeTransitionObject = req.body;
    taskId = req.body.task_id;
    
    historyBody = {
        contact_id: req.body.task_id.contact_id,
        user_id: req.user.id
    }

    if(outcomeTransitionObject){
        taskId = req.body.task_id.id;
        if(outcomeTransitionObject.outcome_id.length > 0){
            transitionObject = outcomeTransitionObject.outcome_id;
            for (var i = 0; i < transitionObject.length ; i++) {
                let requestBody = req.body
                requestBody.task_id = taskId;
                requestBody.user_id = req.user.id
                requestBody.outcome_id = transitionObject[i];
                [err, status] = await to(CallOutcomeTransition.create(requestBody));
                if(err) 
                    return ReE(res, err, 422);
                if(status){
                    historyBody.entity_type = "OUTCOME_TRANSITION";
                    historyBody.entity_id = status.id;
                    [err, history] = await to(History.create(historyBody));
                    if(err) 
                    return ReE(res, err, 422);
                }

                if(err) 
                    return ReE(res, err, 422);
            }
        }else{
            let requestBody = req.body
            requestBody.task_id = taskId;
            requestBody.user_id = req.user.id
            requestBody.outcome_id = null;
            [err, status] = await to(CallOutcomeTransition.create(requestBody));
            if(err) 
                return ReE(res, err, 422);
            if(status){
                historyBody.entity_type = "OUTCOME_TRANSITION";
                historyBody.entity_id = status.id;
                [err, history] = await to(History.create(historyBody));
                if(err) 
                return ReE(res, err, 422);
            }

            if(err) 
                return ReE(res, err, 422);
        }    
    }else{
        return ReE(res, { success: false, message: "Error occurred" }, 401); 
    }
    

    return ReS( res, {
        message : 'Call outcome transition created successfully.'
    }, 200);   
}
module.exports.create = create;