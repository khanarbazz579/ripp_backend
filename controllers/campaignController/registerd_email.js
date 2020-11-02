const Campaign = require('./../../models').campaigns;
const CampaignSubscriberLists = require('./../../models').campaign_subscriber_lists;
// const SubscriberList = require('./../../models').subscriber_lists;
const SubscriberMail = require('./../../models').subscriber_mails;
const checkEmail = async function (req, res) {


    [err, data] = await to(Campaign.findAll(
        {
            where: {
                campaign_id: 81
            },
            include: [{
                model: SubscriberMail,
                as: 'campaign_subscriber_lists',
            }]
        }));

    // console.log("dfffffffffffffffffffffffffffffffffffffffffffff>>>>>>.",data);
    // let err, user;
    // [err, data] = await to(.findAndCountAll(

    // ));

    // if (err) return ReE(res, err, 422);
    // if (user) {
    //     return ReE(res, new Error('Email is already exist.'), 200);
    // }
    return ReS(res, { data: data, success: true, message: 'Email is available.' }, 200);
}
module.exports.checkEmail = checkEmail;

