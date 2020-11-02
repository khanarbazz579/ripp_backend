const express = require('express');
const router = express.Router();
const { get, save, update, destroy } = require('../../controllers/analyticsController/app.controller');

const passport = require('passport');
const strategy = require('../../middleware/passport');
passport.use(strategy)

const { can } = require('../../middleware/CheckAccessMiddleware');

router.get('/:id?',passport.authenticate('jwt', { session: false }), get);
router.post('/',  passport.authenticate('jwt', { session: false }), save);
router.put('/', update);
router.delete('/',passport.authenticate('jwt', { session: false }), destroy);

module.exports = router;