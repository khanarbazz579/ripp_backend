const History = require('../../models').histories;

const remove = async function(req, res){
    let err, historyId;

    if( req.params.history_id && isNaN(parseInt(req.params.history_id)) )
        return ReE(res, { success: false, message: 'It should have requested history id.' }, 401);
    
    historyId = req.params.history_id;

    try{
        [err, history] = await to(
            History.destroy({
                where: { id: historyId }
            })
        );
    }catch(err){
        return ReE(res, { success: false, message: "Exception :"+err.message }, 401); 
    }
    
    if(err) {
        return ReE(res, 'Error occured trying to delete history', 422);
    }

    return ReS(res, { message: 'Deleted History.' }, 200);
}
module.exports.remove = remove;