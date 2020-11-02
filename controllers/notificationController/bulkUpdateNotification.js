const Notification = require('../../models').notifications;

const bulkUpdate = async function (req, res) {
    let err, data;
    
    if(!req.body.criteria){
        return ReE(res, { success: false, message: 'Criteria is required.' }, 401);
    }

    if(!req.body.data){
        return ReE(res, { success: false, message: 'Data to be updated is required.' }, 401);
    }

    let criteriaBody = req.body.criteria;
    let dataToBeUpdated = req.body.data;

    [err, data] = await to(
        Notification.update(dataToBeUpdated, {
            where: criteriaBody
        })
    )

    if (err) {
        return ReE(res, err, 422);
    }
    
    return ReS(res, {
        message: 'Notification updated successfully.'
    }, 200);
};

module.exports.bulkUpdate = bulkUpdate;
