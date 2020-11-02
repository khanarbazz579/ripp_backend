const CustomField = require('../../models').custom_fields;

const updateCustomFieldAttibute = async function (req, res) {
    let {
        id,
        additional_attribute
    } = req.body;
    additional_attribute = JSON.stringify(additional_attribute);
  
    const [err,data] = await to(CustomField.update({
        additional_attribute: additional_attribute
    }, {
        where: {
            id: id
        }
    }));

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        data: data
    }, 201);

};

module.exports.updateCustomFieldAttibute = updateCustomFieldAttibute;