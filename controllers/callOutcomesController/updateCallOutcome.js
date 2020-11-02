const CallOutcome = require('../../models').call_outcomes;

//Update a outcomes object through requested id
const update = async function (req, res) {
    let err, data;

    let outcomeId = req.params.id;
    let outcomeBody = req.body;

    if(!outcomeBody.name){
        return ReE(res, { success: false, message: 'Name is required.' }, 401);
    }

    [err, data] = await to(
        CallOutcome.findByPk(outcomeId)
    );

    if (err) {
        return ReE(res, err, 422);
    }

    [err, data] = await to(
        data.update(outcomeBody)
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        call_outcome: data,
        message: 'Call outcome updated successfully.'
    }, 200);
};

//Bulk updates a call outcome object
const bulkUpdate = async function (req, res) {
    let err, data;
    let outcomeBody = req.body;

    await outcomeBody.forEach(async function (value, index) {
        [err, data] = await to(CallOutcome.update({
            priority_order: value.priority_order
        }, {
            where: {
                id: value.id
            }
        }))

        if (err) {
            return ReE(res, err, 422);
        }
    });

    return ReS(res, {
        stage: outcomeBody,
        message: 'Call outcomes updated successfully.'
    }, 200);
};

module.exports = {
    update: update,
    bulkUpdate: bulkUpdate
}