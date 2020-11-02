const GlobalNotification = require('../../models').global_notification_settings;

//Update a global notification object through requested id
const update = async function(req, res){

    let err, setting, setting_type;

    let valid_type = [
        "call", "todo", "event", "email", "lead", "client", "supplier", "user_media"        
    ]

    if((valid_type.includes(req.params.type))){
        setting_type = req.params.type;
        
        let typeArray = [];
        typeArray.push(setting_type);

        if(setting_type == "event"){
            typeArray.push("EVENT_ACCEPT");
            typeArray.push("EVENT_REJECT");
            typeArray.push("EVENT_MAY_BE");            
        }
        
        [err, setting] = await to(
            GlobalNotification.update({ is_active: req.body.is_active },{
                where : {
                    type : typeArray
                }
            })
        );  

        if (err) {
            return ReE(res, err, 422);
        }

        return ReS(res, { setting: setting, message: 'Settings updated successfully.' });
    }else{
        return ReE(res, { success: false, message: 'It should have requested type.' }, 401);
    } 
    
}
module.exports.update = update;
