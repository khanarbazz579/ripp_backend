const Models = require('../../models');
const SegmentlList = Models.segment_lists;
const Users = Models.users;

/* method to create a new segment with list id*/
const createSegment = async function (req, res) {
    const FieldObject = req.body;
    const id = Number(req.params.list_id);
    let err, list, count;
    if (isNaN(id)) {
        return ReE(res, { success: false, message: 'Invalid Route.' }, 422);
    } else if (!FieldObject.segment_name) {
        return ReE(res, { success: false, message: 'Segment Name is required.' }, 422);
    } else {
        [err, count] = await to(SegmentlList.max('priority_order'));
        if (err) return ReE(res, err, 422);
        let user = req.user;
        FieldObject.list_id = Number(id);
        FieldObject.created_by = Number(user.id);
        FieldObject.priority_order = (isNaN(count)) ? 1 : (count + 1);
        [err, list] = await to(SegmentlList.create(FieldObject));

        if (err) {
            if (err.type && err.type === 'SequelizeDatabaseError') {
                return ReE(res, { success: false, message: 'Server database error, unable to add segment.' }, 422);
            } else {
                return ReE(res, err, 422);
            }
        }
        if (list.dataValues) list.dataValues.By = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            fullName: user.first_name + ' ' + user.last_name
        }
        return ReS(res, {
            data: list
        }, 200);
    }
};

/* method to get all segments */
const getAll = async function (req, res) {
    let err, segments;
    [err, segments] = await to(SegmentlList.findAll({
        include: {
            model: Users,
            as: 'By',
            attributes: ['id', 'first_name', 'last_name']
        }
    }));
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: segments }, 200);
};

/* method to update segments with segment id */
const update = async function (req, res) {
    const id = Number(req.params.segment_id);
    let FieldObject = req.body,
        user = req.user, err, list;
    if (isNaN(id)) return ReE(res, { message: 'Invalid Route.' }, 422);
    [err, list] = await to(SegmentlList.update(FieldObject, { where: { id, created_by: user.id } }));
    FieldObject.id = id;
    if (Boolean(list))
        return ReS(res, { data: FieldObject, message: 'Segment list updated successfully.' }, 200);
    else
        return ReE(res, err, 422);
};

/* method to delete segments with segment id */
const deleteSegment = async function (req, res) {
    const id = req.params.segment_id;
    let err, list;
    [err, list] = await to(SegmentlList.destroy({
        where: {
            id
        },
    },
    ));
    if (err) return ReE(res, err, 422);
    return ReS(res, {
        data: list
    }, 200);
};


module.exports = {
    create: createSegment,
    getAllSegments: getAll,
    update,
    deleteSegment
}