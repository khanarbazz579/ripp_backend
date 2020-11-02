const Campaign = require('./../../models').campaigns;
const SubscriberMail = require('./../../models').subscriber_mails;
const StatusService = require('../../services/campaignService');
const CampaignSubscriberLists = require('./../../models').campaign_subscriber_lists;

module.exports.update = async function (req, res, next) {

    let err, data;

    if (req.body.status) {
        req.body.status = StatusService.getstatus(req.body.status);
    }

    let user = req.user;
    if (!req.body.email_template_id) {
        req.body.email_template_id = null;
    }

    data = {
        ...req.body,
        user_id: user.id
    };

    [err, campData] = await to(Campaign.update(data, {
        where: {
            id: req.params.id

        }
    }));
    if (err) {
        return ReE(res, err, 422);
    }

    let sendData = [];
    [err, sendData] = await to(CampaignSubscriberLists.findAll(
        {
            where: {
                campaign_id: req.params.id
            },
        }
    ));

    let newList = (req.body.our_subscribers) ? req.body.our_subscribers : [];
    if (sendData) {
        sendData.forEach(oneSubList => {
            let listID = oneSubList.getDataValue('subscriber_list_id');
            if (!newList.includes(listID)) {
                oneSubList.destroy();
            }
            let index = newList.indexOf(listID);
            if (index > -1) {
                newList.splice(index, 1);
            }
        });
    }

    let saveDataArray = [];

    newList.forEach(oneListId => {
        saveDataArray.push({
            campaign_id: +req.params.id,
            subscriber_list_id: oneListId.id
        });
    });

    if (saveDataArray.length > 0) {
        [err, sendData] = await to(CampaignSubscriberLists.bulkCreate(saveDataArray));
        if (err) {
            return ReE(res, err, 422);
        }
    }

    return ReS(res, {
        data: data,
        message: "Campaign Updated"
    }, 201);
}
