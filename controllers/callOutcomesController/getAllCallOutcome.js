const CallOutcome = require('../../models').call_outcomes;

//Get all call outcome objects
const getAll = async function(req, res){
    
    let err, outcomeObjects;
    
    [err, outcomeObjects] = await to(
    	CallOutcome.findAll({
    		order: [['priority_order', 'ASC']]
    	})
    );
    
    if(err) 
        return ReE(res, err, 422);

    return ReS( res, {
    	call_outcomes : outcomeObjects
    }, 200);   

}
module.exports.getAll = getAll;