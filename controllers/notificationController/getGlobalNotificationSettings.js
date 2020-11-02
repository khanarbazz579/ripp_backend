const GlobalNotification = require('../../models').global_notification_settings;

//Get a global notification object through requested id
const get = async function(req, res){

	let settingType = req.params.type;

	let valid_type = [
        "CALL", "TODO", "EVENT", "EMAIL", "LEAD", "CLIENT", "SUPPLIER", "USER_MEDIA"        
    ]

	if((valid_type.includes(req.params.type))){
    	let [err, setting] = await to(
	        GlobalNotification.findOne({
	        	where:{
	        		type: settingType
	        	}
	        })
	    );  

	    if (err) {
	        return ReE(res, err, 422);
	    }

	    return ReS(res, { setting: setting });     
    }else{
    	return ReE(res, { success: false, message: 'It should have type.' }, 401);
    }
}
module.exports.get = get;
