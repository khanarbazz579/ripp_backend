const Campaign = require('./../../models').campaigns;
const SubscriberList = require('./../../models').subscriber_lists;
const CampaignSubscriberLists = require('./../../models').campaign_subscriber_lists;
const SubscriberMail = require('./../../models').subscriber_mails;
const StatusService = require('../../services/campaignService');
module.exports.get_status = async function (req, res, next) {
    let draftCount, allCount, completeCount, deleteCount, sendingCount, readyCount;
    let err, data;

    let user_id = {
        $in: [req.user.id]
    };

    if (req.roleAccess.isActive) {
        user_id = {
            $in: req.roleAccess.users
        }
    }

    [err, draftCount] = await to(Campaign.count(
        {
            where: {
                user_id,
                status: StatusService.getstatus("DRAFT")
            }
        }
    ));

    let allStatus = StatusService.getstatus();
    Object.keys(allStatus).forEach(function(key,index) {
        if(allStatus[key] == 'DELETED') {
            delete allStatus[key];
        }
    });

    [err, allCount] = await to(Campaign.count({
        where: {
            status: {
                $in: Object.keys(allStatus)
            },
            user_id,
        },
        paranoid: false
    }));

    [err, completeCount] = await to(Campaign.count(
        {
            where: {
                user_id,
                status: StatusService.getstatus("COMPLETED")
            }
        }
    ));

    [err, deleteCount] = await to(Campaign.count(
        {
            where: {
                user_id,
                status: StatusService.getstatus("DELETED")
            },
            paranoid: false
        }
    ));

    [err, sendingCount] = await to(Campaign.count(
        {
            where: {
                user_id,
                status: StatusService.getstatus("SENDING")
            }
        }
    ));

    [err, readyCount] = await to(Campaign.count(
        {
            where: {
                user_id,
                status: StatusService.getstatus("SCHEDULED")
            }
        }
    ));

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        draftCount: draftCount,
        allCount: allCount,
        sendingCount: sendingCount,
        completeCount: completeCount,
        deleteCount: deleteCount,
        readyCount: readyCount
    }, 201);
}