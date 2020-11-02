const SubscriberList = require('./../../models').subscriber_lists;
const SubscriberMail = require('./../../models').subscriber_mails;

const Sequelize = require('sequelize');

module.exports.getList = async function (req, res, next) {
    let err, data;
    let user = req.user;
    let seachFor = (req.body.order.search) ? req.body.order.search : '';
    let orderData = (req.body.order.sort) ? req.body.order.sort : { by: 'created_at', type: 'DESC'}
    console.log(req.body.order)
    console.log("Got req.body.seachFor", seachFor);
    console.log("Got req.body.orderData", orderData);
    
    [err, data] = await to(SubscriberList.findAndCountAll(
        {
            attributes: ['id', 'name', 'description'],
            order: [
                [orderData.by, orderData.type]
            ],
            where: {
                user_id: user.id,
                $or: {
                    name: { $like: '%' + seachFor + '%' },
                    // '$subscriber_mails.email$': { $like: '%' + seachFor + '%' }
                }
            },
            include: [
                {
                    model: SubscriberMail,
                    attributes: ['id', 'email']
                    // attributes: [ [Sequelize.fn("COUNT", Sequelize.col("subscriber_mails.email")), "emailCount"] ],
                    // group: ["COUNT"],
                    // count: [SubscriberMail.findAndCountAll(
                    //     subscriber_mails.email
                    // )]
                    
                    //count: [Sequelize.fn("COUNT", Sequelize.col("subscriber_mails.email")), "emailCount"]
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