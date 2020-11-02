const Campaign = require('./../../models').campaigns;
const StatusService = require('../../services/campaignService');
const hardDelete = async function (req, res) {
    let err, data;

    [err, data] = await to(
        Campaign.destroy({
            where: {
                id: {
                    $in: req.body.id
                }
            },
            force:true
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }
    console.log("--data---------",data);
    return ReS(res, { data: data }, 200);
};

module.exports.hardDelete = hardDelete;