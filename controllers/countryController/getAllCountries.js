const Country = require('../../models').countries;

//Get all countries 
const getAll = async function(req, res){
    
    let country, err;
    
    [err, country] = await to(
        Country.findAll()
    );

    if(err){
        return ReE(res, err);
    }
    
    return ReS(res, { 
    	countries : country 
    });
}
module.exports.getAll = getAll;