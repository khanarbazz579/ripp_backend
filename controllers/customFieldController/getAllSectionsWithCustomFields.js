const { getCustomFieldsOfType } = require('../../services/getSectionsWithAdditionalAttribute');

//Get all custom fields with their attribute 
const getSectionsWithAttribute = async function (req, res) {
    const sectionType = req.params.type;
    const [err, sections] =await getCustomFieldsOfType(sectionType);

    if (err) {
        return ReE(res, err);
    }

    return ReS(res, {
        sections: sections
    });
};

module.exports.getSectionsWithAttribute = getSectionsWithAttribute;