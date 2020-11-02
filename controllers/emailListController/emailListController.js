const Sequelize = require('sequelize');
const Models = require('../../models');
const EmailList = Models.email_lists;
const SegmentlList = Models.segment_lists;
const Subscribers = Models.subscribers;
const Users = Models.users;
const ContactFilters = Models.contact_filters;
const TemplateLinks = Models.template_links;
const { filterSubscribers } = require('../emailListController/contactFilterController');
// const EmailListSettings = Models.email_list_settings;

/* Create an email list */
const createList = async function ({ body, user }, res) {
    try {
        const EmailListFieldObject = body;
        let err, list, count;
        if (!EmailListFieldObject.list_name) return TE('List Name is required.');

        count = await EmailList.max('priority_order');

        EmailListFieldObject.created_by = Number(user.id);
        EmailListFieldObject.priority_order = (isNaN(count)) ? 1 : (count + 1);
        list = await EmailList.create(EmailListFieldObject);
        if (list && list.dataValues) {
            list.dataValues.By = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                fullName: user.first_name + ' ' + user.last_name
            }
            list.dataValues.subscribers = [];
        }
        return ReS(res, {
            data: list
        }, 200);
    } catch (err) {
        return ReE(res, { message: err.message }, 422);
    }
};

/* Get total email list count */
const getListCount = async function (req, res) {
    try {
        let count, user_id = [req.user.id]
        if (req.roleAccess.isActive) {
            user_id = req.roleAccess.users;
        }

        count = await EmailList.count({
            where: {
                created_by: user_id
            }
        });
        return ReS(res, { listCount: count }, 200);
    } catch (err) {
        return ReE(res, { message: err.message }, 422);
    }
};

/* Get all email list data */
const getAll = async function (req, res) {
    const includeSegments = req.query.include_segments;
    let err, list, { roleAccess, user } = req, user_id;

    user_id = [user.id]
    if (roleAccess.isActive) {
        user_id = roleAccess.users;
    }

    if (includeSegments) {
        [err, list] = await to(EmailList.findAll({
            where: {
                created_by: user_id
            },
            include: [{
                model: SegmentlList,
                as: 'segments',
                include: [
                    {
                        model: Users,
                        as: 'By',
                        attributes: ['id', 'first_name', 'last_name']
                    },
                    {
                        model: ContactFilters,
                        as: 'filter',
                        // order: ['ContactFilters.type', 'DESC']
                    }
                ],
            },
            {
                model: Users,
                as: 'By',
                attributes: ['id', 'first_name', 'last_name']
            },
            {
                model: Subscribers,
                as: 'subscribers',
                attributes: ['id'],
            }
            ]
        }));

        if (list.length) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].dataValues) {
                    let lst = list[i].dataValues;
                    if (lst && lst.segments && lst.segments.length && lst.segments.length > 0) {
                        for (let j = 0; j < lst.segments.length; j++) {
                            const seg = lst.segments[j] ? lst.segments[j].dataValues : null;
                            if (seg) {
                                // seg.subscribersCount = lst.subscribers.length;
                                seg.subscribersCount = 0;
                                if (seg.filter && seg.filter.length && seg.filter.length > 0) {
                                    let found = seg.filter.find(el => el.type === 'segment');
                                    let filter = found ? found.dataValues : null;
                                    if (filter && filter.filterJson) {
                                        if (typeof filter.filterJson === 'string') filter.filterJson = JSON.parse(filter.filterJson);
                                        if (filter.filterJson && filter.filterJson.length && filter.filterJson.length > 0) {
                                            let data = await filterSubscribers(filter.filterJson, seg.list_id, res,user_id, true);
                                            seg.subscribersCount = data.length;
                                        }
                                    }
                                }
                            }
                        }
                    } 
                    // else {
                    //     break;
                    // }
                }
            }
        }
    } else {
        [err, list] = await to(EmailList.findAll({
            where: {
                created_by: user_id
            },
        }));
    }


    if (err) return ReE(res, err, 422);
    return ReS(res, {
        data: list
    }, 200);
};

/* Get an email list by its id and all associated segments */
const getListByIdAndItsSegments = async function (req, res) {
    const id = Number(req.params.list_id);
    let err, list;
    if (isNaN(id)) return ReE(res, { success: false, message: 'Invalid Route.' }, 422);

    [err, list] = await to(EmailList.findAll({
        where: {
            id
        },
        include: [{
            model: Users,
            as: 'By',
            attributes: ['id', 'first_name', 'last_name']
        },
        {
            model: SegmentlList,
            include: [{
                model: Users,
                as: 'By',
                attributes: ['id', 'first_name', 'last_name']
            }],
            as: 'segments',
            where: {
                list_id: Sequelize.col('email_lists.id')
            }
        }
        ]
    }));

    if (err) return ReE(res, err, 422);
    return ReS(res, {
        data: list
    }, 200);
};

/* Update an email list */
const update = async function (req, res) {
    const id = Number(req.params.list_id);
    let FieldObject = req.body,
        user = req.user,
        err, list;
    if (isNaN(id)) return ReE(res, { message: 'Invalid Route.' }, 422);
    [err, list] = await to(
        EmailList.update(FieldObject, {
            where: { id, created_by: user.id }
        })
    );
    FieldObject.list_id = Number(id);
    if (Boolean(list))
        return ReS(res, {
            data: FieldObject,
            message: 'Email list updated successfully.'
        }, 200);
    else
        return ReE(res, err, 422);
};

/* Deletes an email list */
const deleteEmailList = async function (req, res) {
    const id = Number(req.params.list_id);
    if (isNaN(id)) return ReE(res, { success: false, message: 'Invalid Route.' }, 422);

    let err, list, templateLink;
    [err, list] = await to(EmailList.destroy({
        where: {
            id
        },
    }));
    if (err) return ReE(res, err, 422);

    [err, list] = await to(SegmentlList.destroy({
        where: {
            list_id: id
        },
    }));
    if (err) return ReE(res, err, 422);

    [err, list] = await to(Subscribers.destroy({
        where: {
            list_id: id
        },
    }));
    if (err) return ReE(res, err, 422);

    [err, templateLink] = await to(TemplateLinks.destroy({
        where: {
            list_id: id
        },
    }));
    if (err) return ReE(res, err, 422);

    return ReS(res, {
        data: list
    }, 200);
};

/* Updates an email list */
const updateListName = async function (req, res) {
    const id = Number(req.params.list_id);
    let user = req.user,
        err, list;
    if (isNaN(id)) return ReE(res, { message: 'Invalid Route' }, 422);
    [err, list] = await to(
        EmailList.update({
            list_name: req.body.list_name
        }, {
            where: { id, created_by: user.id }
        }));
    if (err)
        return ReE(res, err, 422)
    else
        return ReS(res, { message: 'Email list name updated successfully.' }, 200);
};

/* Get email list details with their id's */
const getEmailListDetails = async function (req, res) {
    let err, list;
    const queryData = JSON.parse(req.query.filter);

    if (!queryData.listId.length) return ReE(res, { success: false, message: 'Empty Email Ids received' }, 422);
    [err, list] = await to(EmailList.findAll({
        where: {
            id: queryData.listId
        },
        include: [
            {
                model: Subscribers,
                as: 'subscribers',
                attributes: ['id'],
            }
        ]
    }));

    if (err)
        return ReE(res, err, 422)
    else
        return ReS(res, {
            data: list
        }, 200);
};

/* Search for email lists */
const searchEmailLists = async function (req, res) {
    let err, emailLists;
    const user_id = [req.user.id]

    if (req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }

    try {
        const searchString = req.query.searchFor;
        let queryObject = {
            distinct: true,
            where: {
                $and: {
                    list_name: { $like: '%' + searchString + '%' },
                    created_by: {
                        $in: user_id
                    }
                },
            },
            include: [
                {
                    model: Subscribers,
                    as: 'subscribers',
                    attributes: ['id'],
                }
            ]
        };
        [err, emailLists] = await to(EmailList.findAll(
            queryObject
        ));
        
        if (err)
            // return ReE(res, err, 422);
            throw err;
        else
            return ReS(res, {
                data: emailLists
            }, 200);
    } catch (err) {
        return ReS(res, err.message, 200);
    }
};

/* Exports */
module.exports = {
    create: createList,
    getListCount,
    getAll,
    getListByIdAndItsSegments,
    update,
    deleteEmailList,
    updateListName,
    getEmailListDetails,
    searchEmailLists
}
