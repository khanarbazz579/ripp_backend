const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
const { getListStatistics, removeSubscriber } = require('../../controllers/emailListController/listStatisticsController');
const { handleWebHookRequests } = require('../../controllers/emailListController/listStatisticsWebHookController');
const { handleClickedLinksRecords } = require('../../controllers/emailListController/listStatisticsWebHookController');

passport.use(strategy);

/* get email list statistics by id */
router.get('/byId', passport.authenticate('jwt', { session: false }), getListStatistics);
router.post('/webhook', handleWebHookRequests);
/* for saving the email template clicked link in the database */
router.post('/trackClicks', handleClickedLinksRecords);
/* delete hardbounce contact */
router.delete('/removeSubscriber', passport.authenticate('jwt', { session: false }), removeSubscriber);

module.exports = router;