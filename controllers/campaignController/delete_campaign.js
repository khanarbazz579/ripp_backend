const Campaign = require('./../../models').campaigns;
const StatusService = require('../../services/campaignService');
const remove = async function (req, res) {
    let err, data, data1, sendData;

    sendData =
        {
            status: StatusService.getstatus('DELETED')
        };

    [err, data] = await to(Campaign.update(sendData, {
        where: {
            id: {
                $in: req.body.id
            }
        }
    }));


    [err, data1] = await to(
        Campaign.destroy({
            where: {
                id: {
                    $in: req.body.id
                }
            }
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, { data1: data1 }, 200);
};

module.exports.remove = remove;


    