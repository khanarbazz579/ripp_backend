const Currency = require('../../models').currencies;

//Get all currencies 
const getAll = async function(req, res){
    
    let currency, err;
    
    [err, currency] = await to(
        Currency.findAll()
    );

    if(err){
        return ReE(res, err);
    }
    
    return ReS(res, { 
    	currency : currency 
    });
}
module.exports.getAll = getAll;