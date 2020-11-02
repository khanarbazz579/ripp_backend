const Models = require('../../models');
const Subscribers = Models.subscribers;
const Contact = Models.contacts;
const EmailList = Models.email_lists;

/* Adds a contact */
const addContact = async function (req, res) {
    let contact, FieldObject = req.body;
    [err, contact] = await to(Contact.create(FieldObject));
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: contact, message: 'Contact added successfully. ' }, 200);
}

/* Removes all the subscriber from one or more list by taking list ids as input */
const bulkRemoveSubscribersFromList = async function (req, res) {
    let list_id = req.body.list_id;
    if (!list_id || (list_id.length && list_id.length === 0))
        return ReE(res, { message: 'No list id found to remove subscribers.' }, 422);
    [err, list] = await to(Subscribers.destroy({
        where: {
            list_id
        }
    }));
    if (err) return ReE(res, err, 422);
    return ReS(res, { message: 'Subscribers removed successfully. ' }, 200);
}

/* Transfers all the subscriber from one or more list by taking list ids as input */
const bulkTransferSubscribersFromList = async function (req, res) {
    let selected_list = req.body.selected_list,
        to_list = req.body.to_list;
    [err, list] = await to(Subscribers.update({
        list_id: to_list
    }, {
            where: { list_id: selected_list }
        }));
    if (err) return ReE(res, err, 422);
    return ReS(res, { message: 'Subscribers transfer successfully. ' }, 200);
}

/* Transfer selected contacts of the list to another, takes contact ids as input */
const transferViewSubscribers = async function (req, res) {
    if (!req.body.selectedSubscriberslist) {
        return ReE(res, { message: 'No subscribers list recieved' }, 422);
    }
    [err, list] = await to(Subscribers.update({
        list_id: req.body.to_list
    }, {
            where: { id: req.body.selectedSubscriberslist }
        }));
    if (err) return ReE(res, err, 422);
    return ReS(res, { message: 'Subscribers transfer successfully.' }, 200);
}

/* Removes selected contacts from the list, takes subscriber ids as input */
const removeSelectedSubscribersFromList = async function (req, res) {
    let subscriberId = req.body.subscriber_id;
    if (!subscriberId || (subscriberId.length && subscriberId.length === 0)) {
        return ReE(res, { message: 'No Subscriber Id found to remove.' }, 422);
    }
    [err, subscriber] = await to(Subscribers.destroy({
        where: {
            id: subscriberId
        }
    }));
    if (err) return ReE(res, err, 422);
    return ReS(res, { message: 'Subscribers removed successfully from the list.' }, 200);
}

/* Transfers all the subscriber from list by taking selected list ids as input */
const bulkMergeSubscribersFromList = async function (req, res) {
    let listToCheck = Array.from(req.body.selected_list),
        merged_list = req.body.merged_list,
        listContacts, contactsToAdd, subscribersToCreate = [];

    listToCheck.push(merged_list.id);
    [err, list] = await to(Subscribers.findAll({
        attributes: ['id', 'subscriber_id', 'list_id'],
        where: {
            list_id: listToCheck
        }
    }));

    contactsToAdd = new Set(list.map(lst => lst.subscriber_id))
    contactsToAdd.forEach(id => {
        subscribersToCreate.push({
            subscriber_id: id,
            list_id: merged_list.id
        })
    });

    [err, list] = await to(Subscribers.destroy({
        where: {
            list_id: listToCheck
        }
    }));
    if (err) return ReE(res, { err, callid: 122 }, 422);

    [err, listContacts] = await to(Subscribers.bulkCreate(subscribersToCreate));
    if (err) return ReE(res, { err, callid: 121 }, 422);

    if (req.body.delete_merged) {
        [err, list] = await to(EmailList.destroy({
            where: {
                id: listToCheck
            }
        }));
    }
    if (err) return ReE(res, { err, callid: 123 }, 422);
    let lst, errr;
    if (merged_list.name) {
        [errr, lst] = await to(EmailList.update({
            list_name: merged_list.name
        }, {
                where: { id: merged_list.id }
            }));
        if (err) return ReE(res, { err, callid: 124 }, 422);
    }
    return ReS(res, {
        data: merged_list,
        message: 'List Merged successfully. ',
        delete_merged: (req.body.delete_merged ? req.body.delete_merged : false),
        update_status: lst,
        list
    }, 200);
}


module.exports = {
    addContact,
    bulkRemoveSubscribersFromList,
    bulkTransferSubscribersFromList,
    transferViewSubscribers,
    removeSelectedSubscribersFromList,
    bulkMergeSubscribersFromList
}