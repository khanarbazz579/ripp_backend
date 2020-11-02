const CustomFilter = require('./../../models').custom_filters;
const FilterFields = require('./../../models').custom_filter_fields;
const CustomFields = require('./../../models').custom_fields;

const create = async function (req, res) {
    let err, data;
    let user = req.user;
    data = { ...req.body,
        user_id: user.id
    };
    [err, data] = await to(CustomFilter.create(data, {
        include: [{
            model: FilterFields,
            as: 'fields',
        }]
    }));

    if (err) {
        return ReE(res, err, 422);
    }

    [err, data] = await to(CustomFilter.findOne({
        where: {
            id: data.id
        },
        include : [{
            model: FilterFields,
            as: 'fields',
            include : [{
                model: CustomFields,
                as : 'custom_field'
            }]
        }]
    }));
    
    if (err) {
        return ReE(res, err, 422);
    }
    let _json = data.toJSON();

    return ReS(res, {
        data: _json
    }, 201);
};

module.exports.create = create;