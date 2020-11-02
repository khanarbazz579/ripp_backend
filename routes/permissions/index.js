const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
const {
    getUsers,
    getAllPermissions,
} = require('../../controllers/permissionController');
const { haveRole } = require('../../middleware/CheckAccessMiddleware');
const { PERMISSIONS: { ROLES } } = require('../../constants');

passport.use(strategy);

router.get('/users', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), getUsers);
router.get('/stream/permissions', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), getAllPermissions);
router.post('/individual/save', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), saveIndividualUserPermissions);
router.get('/individual/:userId', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), getIndividualUserPermissions);

//routes for permission sets
router.use('/sets', require('./permissionSets'))
module.exports = router;