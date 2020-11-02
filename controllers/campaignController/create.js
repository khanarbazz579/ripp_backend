const Campaign = require('./../../models').campaigns;
const SubscriberMail = require('./../../models').subscriber_mails;
const StatusService = require('../../services/campaignService');
const CampaignSubscriberLists = require('./../../models').campaign_subscriber_lists;

module.exports.create = async function (req, res, next) {

    let err, data;

    req.body.status = StatusService.getstatus(req.body.status);

    let user = req.user;
    if (!req.body.email_template_id) {
        req.body.email_template_id = null;
    }
    // if (!req.body.is_scheduled) {
    //     req.body.is_scheduled = null;
    // }

    data = {
        ...req.body,
        user_id: user.id
    };

    [err, data] = await to(Campaign.create(data, {
        // include: [{
        //     model: SubscriberMail,
        //     as: 'campaign_subscriber_lists',
        // }]
    }));

    if (err) {
        return ReE(res, err, 422);
    }
    let newList = (req.body.our_subscribers) ? req.body.our_subscribers : [];
    let saveDataArray = [];

    newList.forEach(oneListId => {
        saveDataArray.push({
            campaign_id: data.id,
            subscriber_list_id: oneListId.id
        });
    });

    let objectData;
    if (saveDataArray.length > 0) {
        [err, objectData] = await to(CampaignSubscriberLists.bulkCreate(saveDataArray));
        if (err) {
            return ReE(res, err, 422);
        }
    }

    return ReS(res, {
        data: data,
        message: "Campaign created"
    }, 201);
}
