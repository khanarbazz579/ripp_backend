const Account = require('../../models').accounts;

//Get all countries 
const setTimezone = async function(req, res){
    const { timezone_id } = req.body;
    const { account_id } = req.user;
    let data, err;
    
    [err, data] = await to(
        Account.update({timezone_id : timezone_id },{where: {
            id: account_id
        }})
    );

    if(err){
        return ReE(res, err, 422);
    }
    
    return ReS(res, { 
    	data : data 
    },200);
};

module.exports.setTimezone = setTimezone;