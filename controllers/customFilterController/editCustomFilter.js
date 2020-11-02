const CustomFilter = require('./../../models').custom_filters;
const FilterFields = require('./../../models').custom_filter_fields;
const CustomFields = require('./../../models').custom_fields;

const edit = async function (req, res) {
    let err, data;
    data = req.body;
    [err, data] = await to(CustomFilter.update(data, {
        where: {
            id: req.body.id
        }
    }));
    if (err) {
        return ReE(res, err, 422);
    }

    [err, data] = await to(FilterFields.destroy({
        where: {
            custom_filter_id: req.body.id

        }
    }));

    await asyncForEach(req.body.fields, async element => {
        [err, data] = await to(FilterFields.create({ ...element,
            custom_filter_id: req.body.id
        }));
        if (err) {
            return ReE(res, err, 422);
        }
    });

    [err, data] = await to(CustomFilter.findOne({
        where: {
            id: req.body.id
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

    let _json = data ? data.toJSON() : data;

    return ReS(res, {
        err : err,
        data: _json
    }, 201);
};


module.exports.edit = edit;

const bulkUpdate = async (req, res) => {
    let body = req.body;
    let err, data;
    await asyncForEach(body, async element => {
        [err, data] = await to(CustomFilter.update(element, {
            where: {
                id: element.id
            }
        }));
        if (err) {
            return ReE(res, err, 422);
        }
    });
    return ReS(res, {
        data: data
    }, 201);
};

module.exports.bulkUpdate = bulkUpdate;