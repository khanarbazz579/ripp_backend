const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
passport.use(strategy);

const MeetingRoomController = require('../../controllers/meetingRoomController/MeetingRoomController');
const { PERMISSIONS: { ROLES } } = require('../../constants');
const { haveRole } = require('../../middleware/CheckAccessMiddleware');

router.post('/', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), MeetingRoomController.create);  // create
router.get('/', passport.authenticate('jwt', { session: false }), MeetingRoomController.getAll); // getAll
router.put('/:meeting_room_id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), MeetingRoomController.update);  // update
router.delete('/:meeting_room_id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), MeetingRoomController.remove);  // remove

module.exports = router;