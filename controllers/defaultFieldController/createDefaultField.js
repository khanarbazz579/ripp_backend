/**
 * Created by cis on 27/8/18.
 */
const FormDefaultFields = require('../../models').form_default_fields;

const create = async function(req, res){
    let err, defaultFields;
    let role_id = req.user.role_id;
    let defaultFields_info = req.body.data;
    if(defaultFields_info){
       
        // if(role_id!=1){
        //     return ReE(res, "you don't have privileges to create default Fields",422);
        // }
        [err, defaultFields] = await to(FormDefaultFields.create(defaultFields_info));
        if(err){
            return ReE(res, err, 422);
        }

        let defaultFields_json = defaultFields.toJSON();
        return ReS(res,{defaultFields:defaultFields_json}, 201);
    }
    return ReS(res,{massage: "no data"}, 204);
};

module.exports.create = create;
