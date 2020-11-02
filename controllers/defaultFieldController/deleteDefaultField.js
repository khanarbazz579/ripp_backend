/**
 * Created by cis on 28/8/18.
 */
const FormDefaultFields = require('../../models').form_default_fields;

const remove = async function(req, res){
    let err,data;
    const _id = req.params.id;
    [err, data] = await to(
        FormDefaultFields.destroy({
            where: {
                id : _id
            }
        })
    );

    if(err){
        return ReE(res, err, 422);
    }


    return ReS(res, {DefaultFields:_id},200);
};

module.exports.remove = remove;