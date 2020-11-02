const CallOutcome = require('../../models').call_outcomes;

const remove = async function(req, res){
    let err, data;

    const outcomeId = req.params.id;

    [err, data] = await to(
        CallOutcome.destroy({
            where: {
                id : outcomeId
            }
        })
    );

    if(err){
        return ReE(res, err, 422);
    }

    return ReS(res, {
        call_outcome_id : outcomeId,
        message : "Call outcome deleted successfully."
    },200);
};

module.exports.remove = remove;