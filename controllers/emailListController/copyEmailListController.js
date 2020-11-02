const Models = require('../../models');
const EmailList = Models.email_lists;
const Subscribers = Models.subscribers;
// const Contacts = Models.contacts;

/* Make a copy of an email list and also copy all of its subscribers */
const copyList = async function (req, res) {
    const id = Number(req.params.list_id);

    const FieldObject = req.body;
    let err, list, count, listContacts, contactsToAdd, subscribersToCreate = [];
    if (!FieldObject.list_name) return ReE(res, { message: 'List Name is required.' }, 422);

    [err, count] = await to(EmailList.max('priority_order'));
    if (err) return ReE(res, err, 422);

    let user = req.user;
    FieldObject.created_by = Number(user.id);
    FieldObject.priority_order = (isNaN(count)) ? 1 : (count + 1);

    [err, list] = await to(EmailList.create(FieldObject));
    if (err) return ReE(res, err, 422);

    [err, contactsToAdd] = await to(Subscribers.findAll({
        where: {
            list_id: id
        }
    }));
    if (err) return ReE(res, err, 422);

    if (contactsToAdd) {
        contactsToAdd.forEach(contact => {
            subscribersToCreate.push({
                subscriber_id: contact.subscriber_id,
                list_id: list.id
            })
        });
    }
    if (list && list.dataValues) list.dataValues.subscribers = [];
    if (subscribersToCreate && subscribersToCreate.length > 0) {
        [err, listContacts] = await to(Subscribers.bulkCreate(subscribersToCreate));
        if (list && list.dataValues && listContacts && listContacts.length > 0) {
            listContacts.forEach(subscriber => {
                list.dataValues.subscribers.push(subscriber.id);
            });
        }
        if (err) return ReE(res, err, 422);
    }

    if (list && list.dataValues) list.dataValues.By = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        fullName: user.first_name + ' ' + user.last_name
    }

    return ReS(res, {
        data: list,
        message: 'Email List Copied successfully.',
        subscriberLength: (subscribersToCreate && subscribersToCreate.length ? subscribersToCreate.length : 0),
        subscribersCopied: (listContacts && listContacts.length ? listContacts.length : 0)
    }, 200);

};

module.exports = {
    copyList
}