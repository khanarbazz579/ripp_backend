const LostLeadFields = require('../../models').lost_lead_fields;
const create = async function (req, res) {
    let _info = req.body;
    await LostLeadFields
        .findOrCreate({
            where: {
                lead_client_id: _info.lead_id
            },
            defaults: _info
        })
        .spread(async (data, created) => {
            return ReS(res, {
                data: data,
                created : created
            }, 201);
        });
};
module.exports.create = create;