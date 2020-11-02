const LostLeadIdentifier = require('../../models').lost_lead_identifiers;
const create = async function (req, res) {
    const _info = req.body;
    const [err, data] = await to(LostLeadIdentifier.create(_info));

    if (err) return ReE(res, err, 422);

    return ReS(res, {
        data: data
    }, 201);
};
module.exports.create = create;


const getAll = async function (req, res) {
    const [err, data] = await to(
        LostLeadIdentifier.findAll()
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        data: data
    }, 200);
}
module.exports.getAll = getAll;


const update = async function (req, res) {
    const _id = req.params.id;
    const [err, data] = await to(LostLeadIdentifier.update(req.body, {
        where: {
            id: _id
        }
    }));

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        data: req.body
    }, 200);
}
module.exports.update = update;

const remove = async function (req, res) {
    const _id = req.params.id;
    let [err, data] = await to(LostLeadIdentifier.destroy({
        where: {
            id: _id
        }
    }));

    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, {
        data: _id
    }, 200);
}
module.exports.remove = remove;