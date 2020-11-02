const multipleUpload = require("../../models").multiple_uploads;

/**
 * this function is used for storing the current stage of user in multiple lead upload form
 * @function saveCurrentStage
 * @param {Object} req http request object
 * @param {Object} res 
 * @returns http response
 */
const saveCurrentStage = async (req, res) => {
    const currentStageObj = req.body || {};
    currentStageObj["user_id"] = req.user.id;
    if(!currentStageObj.ref_name){
        return ReE(res, {
            message: "refname cant be blank"
        }, 422);
    }

    let [err, [data , created]] = await to(multipleUpload.findOrCreate({
        where: {
            user_id : currentStageObj.user_id,
            ref_name : currentStageObj.ref_name
        },
        defaults: currentStageObj
    }));
  
    if (!created) {
        [err, data] = await to(data.update(currentStageObj));
    }
 

    if (err) {
        return ReE(res, {
            message: err
        }, 422);
    }

    return ReS(res, {
        message: 'saved current changes',
        data
    }, 201);
};

module.exports.saveCurrentStage = saveCurrentStage;