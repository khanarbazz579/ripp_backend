const express = require('express');
const router = express.Router();

const { get, create, update } = require('../../controllers/analyticsController/activity.controller');
const passport = require('passport');
const strategy = require('../../middleware/passport');
passport.use(strategy)

const { can } = require('../../middleware/CheckAccessMiddleware');

router.get('/', get);
router.post('/', create);
router.put('/', update);

module.exports = router;