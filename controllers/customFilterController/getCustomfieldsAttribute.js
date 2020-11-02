const { getCustomFieldsOfType } = require('../../services/createAttributeForCustomFields');

//Get all custom fields with their attribute 
const getFieldsWithAttribute = async function (req, res) {
    const sectionType = req.params.type;
    const [err, fields] =await getCustomFieldsOfType(sectionType);

    if (err) {
        return ReE(res, err);
    }

    return ReS(res, {
        fields: fields
    });
};

module.exports.getFieldsWithAttribute = getFieldsWithAttribute;