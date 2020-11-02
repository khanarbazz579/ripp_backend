const Note = require('../../models').notes;

const create = async function(req, res){
    
    let err, noteObject;
    noteObject = req.body;

    if(!noteObject.note){
        return ReE(res, { success: false, message: 'Note is required.' }, 401);
    }

    [err, noteObject] = await to(Note.create(noteObject));
    
    if(err) 
        return ReE(res, err, 422);

    return ReS( res, {
    	note : noteObject,
        message : 'Note created successfully.'
    }, 200);   
}
module.exports.create = create;