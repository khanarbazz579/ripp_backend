const SubscriberList = require('./../../models').subscriber_lists;
const SubscriberMail = require('./../../models').subscriber_mails;

module.exports.create = async function (req, res, next) {
    
    let err, data;
    let user = req.user;
    data = {
        ...req.body,
        user_id: user.id
    };
    [err, data] = await to(SubscriberList.create(data, {
        include: [{
            model: SubscriberMail,
            as: 'subscriber_mails',
        }]
    }));

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        data: data,
    }, 201);
}

module.exports.validateCreate = async function (req, res, next) {
    
    next();
}