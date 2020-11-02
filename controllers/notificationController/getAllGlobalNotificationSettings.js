const GlobalNotification = require('../../models').global_notification_settings;

//Get all a global notification object through requested id
const getAll = async function(req, res){

    let [err, settings] = await to(
        GlobalNotification.findAll()
    );  

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, { settings: settings }); 
}
module.exports.getAll = getAll;
