// import { EmailListController, SegmentListController, SubscribersController } from '../../controllers/emailListController/controller';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");

passport.use(strategy);

//email list controllers
const {
    EmailListController,
    SegmentListController,
    listReorderController,
    SubscribersController,
    ListBulkOptionsController,
    CopyEmailListController,
    ContactFilterController,
    leadContactsListController
} = require('../../controllers/emailListController');
const { can } = require('../../middleware/CheckAccessMiddleware');

/* email list routes */
router.post('/', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'add list']), EmailListController.create);
router.get('/', passport.authenticate('jwt', { session: false }), can(['emails', 'lists']), EmailListController.getAll);
router.get('/:list_id/segments', passport.authenticate('jwt', { session: false }), can(['emails', 'lists']), EmailListController.getListByIdAndItsSegments);
router.get('/count', passport.authenticate('jwt', { session: false }), can(['emails', 'lists']), EmailListController.getListCount);
router.put('/reorder', passport.authenticate('jwt', { session: false }), can(['emails', 'lists']), listReorderController.reorderList);
router.put('/:list_id', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'edit list']), EmailListController.update);
router.delete('/deleteEmailList/:list_id/', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'delete list']), EmailListController.deleteEmailList);

router.post('/copylist/:list_id', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'copy list']), CopyEmailListController.copyList);
router.patch('/updateListName/:list_id', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'edit list']), EmailListController.updateListName);
router.get('/getEmailListDetailsByIds', passport.authenticate('jwt', { session: false }), can(['emails', 'lists']), EmailListController.getEmailListDetails);
router.get('/searchEmailList', passport.authenticate('jwt', { session: false }), can(['emails', 'lists']), EmailListController.searchEmailLists);

/* segment routes */
router.post('/:list_id/addsegment', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'segments', 'add segment']), SegmentListController.create);
router.get('/segments', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'segments']), SegmentListController.getAllSegments);
router.put('/segments/reorder', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'segments']), listReorderController.reorderSegment);
router.put('/segment/:segment_id', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'segments', 'edit segment']), SegmentListController.update);
router.delete('/deleteSegment/:segment_id', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'segments', 'delete segment']), SegmentListController.deleteSegment);

/* subscribers routes */
router.get('/getAllContacts', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers']), SubscribersController.getAllContacts);
router.post('/addContactToList', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers', 'add subscriber']),
    SubscribersController.addContactToList);
/* get emaillist subscribers */
router.get('/getListSubscribers/:listId', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers']), SubscribersController.getListSubscribers);
// route to get the contact lead obj
router.get('/getContactLead/:contactId', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers']),
    SubscribersController.getContactLead);
router.delete('/updateEmailListSubscribers', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers', 'edit subscriber']),
    SubscribersController.deleteEmailListSubscribers);

/* Contact add route */
router.post('/addcontact', passport.authenticate('jwt', { session: false }), can(['emails', 'lists']), ListBulkOptionsController.addContact);

/* Email list bulk options routes */
router.delete('/bulk/removelistsubscribers', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers', 'delete subscriber']), ListBulkOptionsController.bulkRemoveSubscribersFromList);
router.put('/bulk/transferlistsubscribers', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers', 'transfer subscriber']), ListBulkOptionsController.bulkTransferSubscribersFromList);
router.put('/bulk/mergelistsubscribers', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers', 'merge subscriber']), ListBulkOptionsController.bulkMergeSubscribersFromList);

/* View Subscribers bulk options routes */
router.delete('/bulk/removeSelectedSubscribersFromList', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers', 'delete subscriber']),
    ListBulkOptionsController.removeSelectedSubscribersFromList);
router.put('/bulk/transferViewSubscribers', passport.authenticate('jwt', {
    session: false
}), can(['emails', 'lists', 'subscribers', 'transfer subscriber']), ListBulkOptionsController.transferViewSubscribers);

/* Contact Filter route */
router.post('/contactfilter', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers']), ContactFilterController.filterData);
router.post('/contactfilter/save', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers']), ContactFilterController.saveContactFilter);
router.get('/contactfilter/:list_id', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers']), ContactFilterController.getContactFilter);
// router.post('/contactfilter/:entity_type', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers']),
//     require('../../controllers/emailListController/getFilterData').getFilterData);
router.get('/contactcustomfields', passport.authenticate('jwt', { session: false }), can(['emails', 'lists', 'subscribers']), ContactFilterController.getContactCustomFields);
/* To use route for statistics */
router.use('/statistics', require('./statistics.route'));

// Lead contacts subscribed list
router.get('/getListByContact/:id', passport.authenticate('jwt', { session: false }), can(['emails', 'lists','subscribers', 'delete subscriber']),leadContactsListController.getListByContact);
router.delete('/removeSubcription',passport.authenticate('jwt', { session: false }), can(['emails', 'lists']),leadContactsListController.removeSubscribersFromList);
router.get('/getEmailList/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['emails', 'lists']),leadContactsListController.getEmailList);
router.post('/addSubscription', passport.authenticate('jwt', { session: false }), can(['emails', 'lists']),leadContactsListController.addSubscription);
module.exports = router;
