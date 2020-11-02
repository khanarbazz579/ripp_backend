const Campaign = require('./../../models').campaigns;
const SubscriberList = require('./../../models').subscriber_lists;
const CampaignSubscriberLists = require('./../../models').campaign_subscriber_lists;

const SubscriberMail = require('./../../models').subscriber_mails;


module.exports.get_campaign_byid = async function (req, res, next) {
    let err, data;
    let user = req.user;

    [err, data] = await to(Campaign.findOne(
        {
            where: {
                id: req.params.id
            },
            include: [
                {
                    model: SubscriberList,
                    as: 'our_subscribers',
                    attributes: ['id', 'user_id', 'name', 'description'],
                    // where: {
                    //     $or: {
                    //         email: { $like: '%' + seachFor + '%' }
                    //     }
                    // }
                }
            ]
        }
    ));

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        data: data,
    }, 201);
}



