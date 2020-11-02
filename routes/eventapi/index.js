const express = require('express');
const passport = require('passport');
const EventController = require('../../controllers/eventController/EventController');
const router = express.Router();
const strategy = require('./../../middleware/passport');
passport.use(strategy);

const convertStringToObject = require("../../middleware/ConvertBase64ToObject");
const { can } = require('../../middleware/CheckAccessMiddleware');

router.post('/events', passport.authenticate('jwt', { session: false }), can(['events', 'add event']), EventController.create);

router.get('/getEvents/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['events']), EventController.getAll);
router.get('/contacts', passport.authenticate('jwt', { session: false }), can(['events']), EventController.getContacts);
router.get('/getContacts/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['events']), EventController.getContactsOnChange);
router.get('/eventCount', passport.authenticate('jwt', { session: false }), can(['events']), EventController.getEventCounts);
router.put('/event/:event_id', passport.authenticate('jwt', { session: false }), can(['events', 'edit event']), EventController.update);
router.post('/deleteEvent/', passport.authenticate('jwt', { session: false }), can(['events', 'delete event']), EventController.remove);
router.post('/resendEmail/', passport.authenticate('jwt', { session: false }), can(['events']), EventController.resendEmail);
router.get('/event/:id', passport.authenticate('jwt', { session: false }), can(['events']), EventController.getSingleEvent);
router.post('/getEventInvitesByEventIds', passport.authenticate('jwt', { session: false }), can(['events']), EventController.getEventInvitesByEventIds);
router.get('/isMeetingRoomAvailable/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['events']), EventController.isMeetingRoomAvailable);
router.post('/acceptRejectInvitation', EventController.acceptRejectInvitation);
router.get('/getEventByKey/:data',convertStringToObject.base64ToString, EventController.getEventByKey);
router.post('/updateStatus', EventController.updateStatusRoute);
router.post('/setInvitationReminder', EventController.setInvitationReminder);
module.exports = router;