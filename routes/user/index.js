const express = require('express');
const router = express.Router();
const passport = require('passport');
passport.use(require('./../../middleware/passport'));

const { uploadProfileImageToAws } = require('../../services/multerS3UserProfile');
const { PERMISSIONS: { ROLES } } = require('../../constants');
const { haveRole } = require('../../middleware/CheckAccessMiddleware');
const { createUser, get, deleteUser, update } = require('../../controllers/userController');

router.post('/create', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), uploadProfileImageToAws, createUser);
router.get('/:_id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), get);
router.put('/:_id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), uploadProfileImageToAws, update);
router.delete('/:_id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), deleteUser);

router.post('/check_is_old_password_is_valid',passport.authenticate('jwt', { session: false }), checkIsOldPasswordIsValid);

module.exports = router;