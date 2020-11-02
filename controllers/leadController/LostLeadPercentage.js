const LeadClient = require('../../models').leads_clients;
const getLostPercentage = async function (req, res) {
    let err, lostleadCount, allLeadCount, clientCount;

    [err, lostleadCount] = await to(
        LeadClient.count({
            where: {
                sales_stage_id: 7
            }
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }


    [err, allLeadCount] = await to(
        LeadClient.count({
            where: {
                sales_stage_id: {
                    [LeadClient.sequelize.Op.ne]: 1
                }
            }
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }
    let percentage = lostleadCount ? ((lostleadCount / allLeadCount) * 100).toFixed(2) > 100 ? 100 : ((lostleadCount / allLeadCount) * 100).toFixed(2) : 0;

    [err, clientCount] = await to(LeadClient.count({
        where: {
            sales_stage_id: 8
        }
    }));

    if (err) {
        return ReE(res, err, 422);
    }
    let clientPercentage = clientCount ? ((clientCount / (allLeadCount)) * 100) > 100 ? 100 : ((clientCount / (allLeadCount)) * 100).toFixed(2) : 0;
    return ReS(res, {
        percentage: percentage,
        clientPercentage: clientPercentage
    }, 200);
}

module.exports.getLostPercentage = getLostPercentage;