const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');

const { haveRole } = require('../../middleware/CheckAccessMiddleware');
const { PERMISSIONS: { ROLES } } = require('../../constants');

passport.use(strategy);

const { destroy, get, save, update, updateParent, getUserByRoleId, getUserTokens } = require('../../controllers/roleAccessController')

router.get('/', passport.authenticate('jwt', { session: false }), get);
router.get('/getUserByRoleId/:role_id', passport.authenticate('jwt', { session: false }), getUserByRoleId);
router.post('/', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), save);
router.put('/updateParent', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), updateParent);
router.put('/:id/update', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), update);
router.delete('/:id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), destroy);

router.get('/tokens', getUserTokens);

module.exports = router;