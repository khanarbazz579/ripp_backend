const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('../../middleware/passport');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");
const CreateSubscriber = require('../../controllers/subscriberController/create');
const UnsubscribeUser = require('../../controllers/subscriberController/unsubscribeUser');
const GetSubscriber = require('../../controllers/subscriberController/get_list');
passport.use(strategy);

router.post('/', passport.authenticate('jwt', { session: false }), CreateSubscriber.create);
router.get('/get_all/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), GetSubscriber.getList);
router.put('/unsubscribe/:listId',passport.authenticate('jwt', { session: false }), UnsubscribeUser.unsubscribeUser);
module.exports = router;