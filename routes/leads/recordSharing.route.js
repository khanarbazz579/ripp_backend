const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
passport.use(strategy);
const { can } = require('../../middleware/CheckAccessMiddleware');

const { stream, create, getSharedUsersByLeadId, getSharedUsersCountByLeadId } = require('../../controllers/recordSharingController');

router.get('/stream/:type', passport.authenticate('jwt', { session: false }), stream);
router.post('/update', passport.authenticate('jwt', { session: false }), can(['leads', 'share leads']), create);
router.post('/updateOwner', passport.authenticate('jwt', { session: false }), can(['leads', 'share leads']), updateOwner);
router.get('/getSharedUsersByLeadId/:lead_id', passport.authenticate('jwt', { session: false }), can(['leads', 'share leads']), getSharedUsersByLeadId);
router.get('/getSharedUsersCount/:lead_id', passport.authenticate('jwt', { session: false }), can(['leads', 'share leads']), getSharedUsersCountByLeadId);

module.exports = router;