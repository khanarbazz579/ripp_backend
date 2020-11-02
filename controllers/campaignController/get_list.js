const datatable = require('sequelize-datatable');
const Campaign = require('./../../models').campaigns;
const SubscriberList = require('./../../models').subscriber_lists;
const CampaignSubscriberLists = require('./../../models').campaign_subscriber_lists;
const SubscriberMail = require('./../../models').subscriber_mails;
const StatusService = require('../../services/campaignService');

const sequelize = require('sequelize');

module.exports.getList = async function(req, res, next) {
    let err, data;
    let user = req.user;
    let seachFor = (req.body.query.search) ? req.body.query.search : '';
    let orderData = (req.body.query.sort) ? req.body.query.sort : { by: 'created_at', type: 'DESC' }
    let statusData = (req.body.query.status) ? req.body.query.status : 'ALL';

    let user_id = [req.user.id];
    if(req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }

    let queryObject = {
        distinct: true,
        // attributes: ['id', 'name', 'description'],
        order: [
            [
                [orderData.by, orderData.type]
            ]
        ],
        attributes: ['id', 'name', 'created_at', 'status', 'updated_at', 'email_percentage','scheduled_time'],
        where: {
            user_id: {
                $in: user_id
            },
            $or: {
                name: { $like: '%' + seachFor + '%' },
                //'$subscriber_mails.email$': { $like: '%' + seachFor + '%' }
            },

        },
        include: [{
            model: SubscriberList,
            as: 'our_subscribers',
            attributes: ['id', 'user_id', 'name', 'description'],
            // where: {
            //     $or: {
            //         email: { $like: '%' + seachFor + '%' }
            //     }
            // }
        }]
    };

    switch (statusData) {
        case "ALL":
            let allStatus = StatusService.getstatus();
            Object.keys(allStatus).forEach(function(key,index) {
                if(allStatus[key] == 'DELETED') {
                    delete allStatus[key];
                }
            });
            queryObject.where.status = {
                $in: Object.keys(allStatus)
            };
            queryObject.paranoid = false;
            break;

        case "SENDING":
            queryObject.where.status = StatusService.getstatus(statusData);
            break;

        case "DRAFT":
            queryObject.where.status = StatusService.getstatus(statusData);
            break;

        case "SCHEDULED":
            queryObject.where.status = StatusService.getstatus(statusData);
            break;

        case "COMPLETED":
            queryObject.where.status = StatusService.getstatus(statusData);
            break;

        case "DELETED":
            queryObject.where.status = StatusService.getstatus(statusData);
            queryObject.paranoid = false;
            break;
        default:
            break;
    }

    [err, data] = await to(Campaign.findAndCountAll(
        queryObject
    ));

    // let recordsTotal;
    // datatable(Campaign, req.body.query,{queryObject}).then((result) => {
    //     result.recordsTotal = data.count ;
    //      return ReS (res,{ message: "all data" }, 201);
    // })
    // datatable(model, req.query, {})
    // .then((result) => {
    //   // result is response for datatables
    //   res.json(result);
    // });
    datatable(Campaign, req.body.query, queryObject)
        .then((result) => {
            result.recordsTotal = data.count;
            return ReS(res, { result:result, total: data.count, message: "all data" },201);
        });

    // if (err) {
    //     return ReE(res, err, 422);
    // }

    // return ReS(res, {
    //     data: data,
    // }, 201);
}