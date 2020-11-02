const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
const {
    getPermissionSets,
    changePermissionSet,
    savePermissionSets,
    updatePermissionSet,
    deletePermissionSet
} = require('../../controllers/permissionController/permissionSets');

passport.use(strategy);

const { haveRole } = require('../../middleware/CheckAccessMiddleware');
const { PERMISSIONS: { ROLES } } = require('../../constants');

router.get('/', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), getPermissionSets);
router.put('/changeUserPermissionSet', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), changePermissionSet);

router.post('/save', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), savePermissionSets);
router.put('/:id/update', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), updatePermissionSet);
router.delete('/:id/destroy', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), deletePermissionSet);

module.exports = router;