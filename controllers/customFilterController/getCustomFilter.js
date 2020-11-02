const CustomFilter = require('./../../models').custom_filters;
const FilterFields = require('./../../models').custom_filter_fields;
const CustomFields = require('./../../models').custom_fields;

const getAll = async function (req, res) {
    const user_id = req.user.id;
    const type = req.params.type;
    const [err, data] = await getCustomFiltersWithCustomFields(user_id,type);

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        err  :err,
        data: data
    }, 200);
};

module.exports.getAll = getAll;
/**
 * this function is used for getting the custom filter of a paticular user, particular type and of ids
 * @param {*number} user_id 
 * @param {*string} type 
 * @param {*array<number>} customFieldIds 
 * @returns { Array<CustomFields> } 
 */
const getCustomFiltersWithCustomFields = async function (user_id,type,customFieldIds=null) {
    let whereObj = {
        user_id: user_id,
        type :type
    };
    if(customFieldIds){
        whereObj["id"]  = customFieldIds
    };

    if(Array.isArray(user_id)) {
        whereObj.user_id = {
            $in: user_id
        }
    }

    const [err, data] = await to(CustomFilter.findAll({
        where: whereObj,
        include: [{
            model: FilterFields,
            as: 'fields',
            include: [{
                model: CustomFields,
                as : 'custom_field'
            }]
        }],
        order: [
            ['priority_order', 'ASC']
        ]
    })); 
    return [err, data];
};

module.exports.getCustomFiltersWithCustomFields = getCustomFiltersWithCustomFields;