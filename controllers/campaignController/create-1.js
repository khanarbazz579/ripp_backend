const Campaign = require('./../../models').campaigns;
const CampaignSubscriberLists = require('./../../models').campaign_subscriber_lists;
const SubscriberList = require('./../../models').subscriber_lists;
// const StatusService = require('../../services/campaignService');

module.exports.create = async function (req, res, next) {

    let err, data;
    //let user = req.user;
    data = {
        ...req.body,
        user_id: 7
    };
    // console.log("At hererer::::::::::", user.id);
    [err, data] = await to(Campaign.create(data, {
        include: [{
            model: CampaignSubscriberLists,
            
        }]
    }));

    if (err) {
        return ReE(res, err, 422);
    }
    
    // data.addSubscriberList([3,4]);

    return ReS(res, {
        data: data,
        message: "Campaign created"
    }, 201);
}



module.exports.update = async function (req, res, next) {

    let err, data;

    // console.log("STAtusdfdsfklsdjfjasfjasfl;afjl;as", req.body.status);
    //let user = req.user;
    data = {
        ...req.body,
        //user_id: user.id
    };
    // console.log("STAtusdfdsfklsdfgdfgdfgdjfjasfjasfl;afjl;as", req.params.id);
    // [err, data] = await to(Campaign.update(data, {
        //     where: {
            //         id: req.params.id
            //     }
            // }));
            // if (err) {
                //     return ReE(res, err, 422);
                // }
                
    let sendData;
    [err, sendData] = await to(CampaignSubscriberLists.findAll(
        {
            where: {
                campaign_id: req.params.id
            },
        }
    ));

    let newList = (req.body.our_subscribers) ? req.body.our_subscribers : [];
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

    let saveDataArray = [];

    newList.forEach(oneListId => {
        saveDataArray.push({
            campaign_id: +req.params.id,
            subscriber_list_id: oneListId
        });
    });
    
    if (saveDataArray.length > 0) {
        [err, sendData] = await to(CampaignSubscriberLists.bulkCreate(saveDataArray));
        if (err) {
            return ReE(res, err, 422);
        }
    }

    return ReS(res, {
        // data: sendData,
        message: "Campaign Updated"
    }, 201);
}
