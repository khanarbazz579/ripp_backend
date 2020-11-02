const Timezones = require('../../models').timezones;

//Get all countries 
const getAll = async function(req, res){
    
    let data, err;
    
    [err, data] = await to(
        Timezones.findAll()
    );

    if(err){
        return ReE(res, err, 422);
    }
    
    return ReS(res, { 
    	data : data 
    },200);
};

module.exports.getAll = getAll;