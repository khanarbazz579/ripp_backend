/**
 * Created by cis on 12/12/18.
 */
const StageCheckStatus = require('../../models').stage_check_statuses

const createOrUpdate = async function (req, res) {
    let err, stage;
    const user_id = req.user.id;
    const stage_info = req.body;
    [err, stage] = await to(StageCheckStatus
        .findOrCreate({
            where: {
                user_id: user_id,
                stage_id: stage_info.stage_id,
                type : stage_info.type
            },
            defaults: {
                ...stage_info,
                user_id: user_id
            }
        })
        .spread(async(foundStage, created) => {
            if (!created) {
                [err, stage] = await to(foundStage.update({user_id: user_id,
                    stage_id: stage_info.stage_id,
                    type : stage_info.type,
                    is_checked : stage_info.is_checked
                }))
            }
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        stage: stage
    }, 201);
};

module.exports.createOrUpdate = createOrUpdate;