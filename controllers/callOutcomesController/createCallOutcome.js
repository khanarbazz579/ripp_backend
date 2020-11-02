const CallOutcome = require('../../models').call_outcomes;

//Create a call outcome object
const create = async function(req, res){
    
    let err, outcomeObject;
    outcomeObject = req.body;

    if(!outcomeObject.name){
        return ReE(res, { success: false, message: 'Name is required.' }, 401);
    }

    [err, outcomeObject] = await to(CallOutcome.create(outcomeObject));
    
    if(err) 
        return ReE(res, err, 422);

    return ReS( res, {
    	call_outcome : outcomeObject,
        message : 'Call outcome created successfully.'
    }, 200);   
}
module.exports.create = create;