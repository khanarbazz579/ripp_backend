const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
passport.use(strategy);

// Email list routes
router.use('/emaillist', require('./emailList.route'));

// Email campaign routes
router.use('/campaigns', require('./emailCampaigns.route'));

// Email subscriber lists
router.use('/subscriber_list', require('./subscriberList.route'));

// Email template routes
router.use(require('./emailTemplate.route'));

module.exports = router;