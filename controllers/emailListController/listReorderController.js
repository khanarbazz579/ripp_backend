const db = require('../../models');

/* method to handle reorder of email-list */
const reorderList = async function (req, res) {
    const pos_id = req.body.pos_id;
    const target_id = req.body.target_id;

    let err, list, sub, query, sm, lg;
    query = `UPDATE email_lists
    SET priority_order = CASE WHEN priority_order = ${target_id} THEN ${pos_id}
                      WHEN ${pos_id} < ${target_id} AND priority_order < ${target_id} THEN priority_order + 1
                      WHEN ${pos_id} > ${target_id} AND priority_order > ${target_id} THEN priority_order - 1
                 END
    WHERE  priority_order BETWEEN LEAST(${target_id}, ${pos_id}) AND GREATEST(${target_id}, ${pos_id})`;
    [err, list] = await to(db.sequelize.query(query));

    if (err) return ReE(res, err, 422);
    return ReS(res, { message: "list reordered successfully." }, 200);
}

/* method to handle reorder of email-list-segment */
const reorderSegment = async function (req, res) {
    const pos_id = req.body.pos_id;
    const target_id = req.body.target_id;
    let err, list, query;
    query = `UPDATE segment_lists
    SET priority_order = CASE WHEN priority_order = ${target_id} THEN ${pos_id}
                      WHEN ${pos_id} < ${target_id} AND priority_order < ${target_id} THEN priority_order + 1
                      WHEN ${pos_id} > ${target_id} AND priority_order > ${target_id} THEN priority_order - 1
                 END
    WHERE  priority_order BETWEEN LEAST(${target_id}, ${pos_id}) AND GREATEST(${target_id}, ${pos_id})`;
    [err, list] = await to(db.sequelize.query(query));

    if (err) return ReE(res, err, 422);
    return ReS(res, { message: "segments reordered successfully." }, 200);
}


module.exports = {
    reorderList,
    reorderSegment
}