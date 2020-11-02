const CustomFilter = require('../../models').custom_filters;
const FilterFields = require('../../models').custom_filter_fields;

const remove = async function (req, res) {
    _id = req.params.id;
   let [err, data] = await to(CustomFilter.destroy({
        where: {
            id:_id
        }
    }));
   
    if(data && _id){
        [err, data] = await to(FilterFields.destroy({
            where: {
                custom_filter_id : _id
            }
        }));
    }
    
    return ReS(res, {
        data:{ id : _id}
    }, 200);
};


module.exports.remove = remove;