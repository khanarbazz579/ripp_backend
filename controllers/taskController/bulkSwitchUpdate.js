const Task = require('../../models').tasks;

//Bulk update the tasks the swictching of contact
const bulkSwitchUpdate = async function(req, res){

    let err, task, allTaskWithLead, multipleTaskId= [];

    let supplier_id = req.body.supplier_id;
    let lead_id = req.body.lead_id;
        
    try{
        [err, allTaskWithLead ] = await to(
            Task.findAll({
                where: {
                    lead_id: lead_id
                }
            })
        );

        if(err){
            return ReE(res, err);
        }
    
        for (var i = 0; i < allTaskWithLead.length; i++) {
            multipleTaskId.push(allTaskWithLead[i].id) 
        }
        
        try{
            [err, task] = await to(
                Task.update({ supplier_id : supplier_id, lead_id: null }, {
                    where: {
                        id: {
                            $in: multipleTaskId
                        }
                    }
                })
            );
            if(err){
                return ReE(res, err);
            }
            return ReS(res, { task:task });
        }catch(err){
            return ReE(res, { success: false, message: "Exception: "+err.message }, 401);
        }
    }catch(err){
        return ReE(res, { success: false, message: "Exception: "+err.message }, 401);
    }
}
module.exports.bulkSwitchUpdate = bulkSwitchUpdate;
