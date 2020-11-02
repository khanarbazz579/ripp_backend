const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('../../middleware/passport');
passport.use(strategy);
const { haveRole } = require('../../middleware/CheckAccessMiddleware');

const { stream, fieldPermissions, removeUserFromSet } = require('../../controllers/customFieldController/fieldAdjustments')
const { PERMISSIONS: { ROLES } } = require('../../constants');

router.get('/stream/:type', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), stream);
router.get('/fieldPermissions', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), fieldPermissions);
router.get('/removeUserFromSet', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), removeUserFromSet);

module.exports = router;