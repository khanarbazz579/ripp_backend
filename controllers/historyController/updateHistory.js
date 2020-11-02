const History = require('../../models').histories;

//Update a history object through requested id
const update = async function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let err, history, historyId, historyObject;

    if (isNaN(parseInt(req.params.history_id)))
        return ReE(res, { success: false, message: 'It should have requested history id.' }, 401);

    try {
        historyId = req.params.history_id;
        historyObject = req.body;
        [err, history] = await to(
            History.update(historyObject, {
                where: { id: historyId }
            })
        );
        if (err) {
            return ReE(res, err);
        }
        return ReS(res, {
            history: history
        });
    } catch (err) {
        return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
    }
}
module.exports.update = update;