const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');

passport.use(strategy);

// Custom Filter
const { getAll } = require('./../../controllers/timezoneController/getTimezone');
const { setTimezone } = require('./../../controllers/timezoneController/setTimeZoneToAccount');
const { haveRole } = require('../../middleware/CheckAccessMiddleware');
const { PERMISSIONS: { ROLES } } = require('../../constants');

router.get('/getAll', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), getAll); // getall time zones
router.post('/setTimezone', passport.authenticate('jwt', { session: false}), haveRole(ROLES.ADMIN), setTimezone)

module.exports = router;