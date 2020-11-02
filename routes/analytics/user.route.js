const express = require('express');
const router = express.Router();
const { get, sync, update } = require('../../controllers/analyticsController/user.controller');

const passport = require('passport');
const strategy = require('../../middleware/passport');
passport.use(strategy)

const { can } = require('../../middleware/CheckAccessMiddleware');

router.get('/:id?', get);
router.post('/sync', sync);
// router.post('/',  passport.authenticate('jwt', { session: false }), save);
router.put('/:id', update);
// router.delete('/',passport.authenticate('jwt', { session: false }), destroy);

module.exports = router;