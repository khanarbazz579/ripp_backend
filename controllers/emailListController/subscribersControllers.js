const Sequelize = require('sequelize');
const Models = require('../../models');
const Subscribers = Models.subscribers;
const Contacts = Models.contacts;
const LeadClient = Models.leads_clients;

// Get All Contacts
const getAllContacts = async function (req, res) {
  let err, list;
  [err, list] = await to(Contacts.findAll(({
    include: [
      {
        model: LeadClient,
        as: 'lead_client'
      },
      {
        model: Subscribers,
        as: 'subscribers'
      }
    ]
  })));
  if (err) {
    return ReE(res, err, 422);
  }
  return ReS(res, {
    data: list
  }, 200);
};

// add contact to list
const addContactToList = async function (req, res) {
  let err, listContact, listContacts, subToCreate = {}, subscribersToCreate = [], contactsToAdd;
  contactsToAdd = req.body.contactId;
  if (!contactsToAdd || contactsToAdd.length === 0) {
    return ReE(res, { success: false, message: 'No contacts received' }, 422);
  } else if (contactsToAdd.length === 1) {
    subToCreate = {
      subscriber_id: contactsToAdd[0],
      list_id: req.body.listId
    };
    [err, listContact] = await to(Subscribers.create(subToCreate));
    if (err) {
      return ReE(res, err, 422);
    }
    return ReS(res, {
      data: listContact
    }, 200);
  } else {
    contactsToAdd.forEach(id => {
      subscribersToCreate.push({
        subscriber_id: id,
        list_id: req.body.listId
      })
    });

    [err, listContacts] = await to(Subscribers.bulkCreate(subscribersToCreate));
    if (err) {
      return ReE(res, err, 422);
    }
    return ReS(res, {
      data: listContacts
    }, 200);
  }
}

// get the subscribers of a list
const getListSubscribers = async function (req, res) {
  const id = Number(req.params.listId);

  let err, listSubscribers;
  if (isNaN(id)) return ReE(res, { success: false, message: 'Invalid Route.' }, 422);

  [err, listSubscribers] = await to(Subscribers.findAll({
    where: {
      list_id: id
    },
    include: [{
      model: Contacts,
      as: 'subscriber',
      where: { id: Sequelize.col('subscribers.subscriber_id') },
      // attributes: ['id', [Sequelize.fn('COUNT', 'subscribers.subscriber_id'), 'SubCount']]
      include: [{
        model: LeadClient,
        as: 'lead_client'
      }]
    }]
  }));

  if (listSubscribers) {
    await asyncForEach(listSubscribers, async el => {
      if (el.dataValues && el.dataValues.subscriber_id) {
        [err, data] = await to(Subscribers.findAll({
          where: {
            subscriber_id: el.dataValues.subscriber_id
          },
          attributes: ['list_id']
        }));
        if (err) {
          return ReE(res, err, 422);
        }
        el.dataValues.subscriber.dataValues.list_id = data;
      }
    });
  }

  if (err) {
    return ReE(res, err, 422);
  }
  return ReS(res, {
    data: listSubscribers
  }, 200);

}

// get the lead of a contact by the contact id
const getContactLead = async function (req, res) {
  const id = Number(req.params.contactId);
  let err, contactLead;
  if (isNaN(id)) return ReE(res, { success: false, message: 'Invalid Route' }, 422);

  [err, contactLead] = await to(Contacts.findAll({
    where: {
      id: id
    },
    include: [{
      model: LeadClient,
      as: 'lead_client'
    }]
  }));
  if (err) {
    return ReE(res, err, 422);
  }
  return ReS(res, {
    data: contactLead
  }, 200);
}

// delete the lead of a contact by the contact id
const deleteEmailListSubscribers = async function (req, res) {
  let subscriberId = req.body.subscriberId, listId = req.body.listId;
  if (!subscriberId) {
    return ReE(res, { message: 'No Subscriber Id recieved to remove.' }, 422);
  }
  if (!listId.length) {
    return ReE(res, { message: 'No List Id recieved to remove.' }, 422);
  }

  [err, subscriber] = await to(Subscribers.destroy({
    where: {
      subscriber_id: subscriberId,
      list_id: listId
    }
  }));

  if (err) return ReE(res, err, 422);
  return ReS(res, { message: 'Subscribers removed successfully from the list.' }, 200);
}

module.exports = {
  getAllContacts,
  addContactToList,
  getListSubscribers,
  getContactLead,
  deleteEmailListSubscribers
}
