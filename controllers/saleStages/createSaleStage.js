/**
 * Created by cis on 27/8/18.
 */
const SaleStage = require('../../models').sales_stages;

const create = async function(req, res){
    let err, stage;
    let user_id = req.user.id;
    let stage_info = req.body.data;
    if(stage_info){
        [err, stage] = await to(SaleStage.create(stage_info));
        if(err){
            return ReE(res, err, 422);
        }

        let stage_json = stage.toJSON();
        return ReS(res,{stage:stage_json}, 201);
    }
    return ReS(res,{massage: "no data"}, 204);
};

module.exports.create = create;
