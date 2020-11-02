/**
 * Created by cis on 28/8/18.
 */
const SaleStage = require('../../models').sales_stages;

const remove = async function(req, res){
    let err,data;
    const _id = req.params.id;

    [err, data] = await to(
        SaleStage.destroy({
            where: {
                id : _id
            }
        })
    );

    if(err){
        return ReE(res, err, 422);
    }


    return ReS(res, {stage_id:_id},200);
};

module.exports.remove = remove;