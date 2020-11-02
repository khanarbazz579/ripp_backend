/**
 * Created by cis on 28/8/18.
 */
const SaleStage = require('../../models').sales_stages;

//Update a task object through requested id
const update = async function (req, res) {
    let err, data;

    let _id = req.params.id;
    let _body = req.body;

    [err, data] = await to(
        SaleStage.findByPk(_id)
    );

    if (err) {
        return ReE(res, err, 422);
    }

    [err, data] = await to(
        data.update(_body)
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        stage: data,
        message: 'Sales Stage updated successfully.'
    }, 200);
};

module.exports.update = update;

//Update a task object through requested id
const bulkUpdate = async function (req, res) {
    let err, data;
    let order_body = req.body;

    await order_body.forEach(async function (value, index) {
        [err, data] = await to(SaleStage.update({
            priority_order: value.priority_order
        }, {
            where: {
                id: value.id
            }
        }))

        if (err) {
            return ReE(res, err, 422);
        }
    });

    return ReS(res, {
        stage: order_body,
        message: 'Sales Stage updated successfully.'
    }, 201);
};

module.exports.bulkUpdate = bulkUpdate;