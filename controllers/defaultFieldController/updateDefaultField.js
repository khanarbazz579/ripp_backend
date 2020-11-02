/**
 * Created by cis on 27/8/18.
 */
const FormDefaultFields = require('../../models').form_default_fields;

const update = async function (req, res) {
    let err, defaultFields;
    const role_id = req.user.role_id;
    const defaultFields_info = req.body;
    const _id = req.params.id;
    if (defaultFields_info) {
        // if (role_id != 1) {
        //     return ReE(res, "you don't have privileges to update default Fields", 422);
        // }

        [err, defaultFields] = await to(FormDefaultFields.findByPk(_id));

        if (err) {
            return ReE(res, err, 422);
        }

        [err, defaultFields] = await to(defaultFields.update(defaultFields_info));

        if (err) {
            return ReE(res, err, 422);
        }

        let defaultFields_json = defaultFields.toJSON();
        return ReS(res, {
            defaultFields: defaultFields_json
        }, 201);
    }
    return ReS(res, {
        massage: "no data"
    }, 204);
};

module.exports.update = update;

//Update a task object through requested id
const bulkUpdate = async function (req, res) {
    let err, data;
    let order_body = req.body;
    await order_body.forEach(async function (value, index) {
        [err, data] = await to(FormDefaultFields.update({
            priority_order: value.priority_order
        }, {
            where: {
                id: value.id
            }
        }))
        if (err) {
            return ReE(res, err, 422);
        }
    })

    return ReS(res, {
        data: order_body,
        message: 'updated successfully.'
    }, 201);
};

module.exports.bulkUpdate = bulkUpdate;