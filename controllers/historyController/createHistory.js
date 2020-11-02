const History = require('../../models').histories;
const Note = require('../../models').notes;

const create = async function(req, res){
    
    const historyObject = req.body;
    
    let err, history;
    
    try{
        historyObject.user_id = req.user.id;

        [err, history] = await to(
            History.create(historyObject)
        );
        if(err) {
            return ReE(res, err, 422);
        }

        history = history.toJSON();
        history.user = req.user;

        if(history.entity_id){
            let history_note;
            try{
                [err, history_note] = await to(
                    Note.findByPk(history.entity_id)
                );
                if(err) {
                    return ReE(res, err, 422);
                }else{
                    history.note = history_note;
                }
            }catch(err){
                return ReE(res, { success: false, message: "Exception :"+err.message }, 401); 
            }    
        }

        return ReS( res, {
            history : history
        }, 200);  
    }catch(err){
        return ReE(res, { success: false, message: "Exception :"+err.message }, 401); 
    }

}
module.exports.create = create;