const express = require('express');
const router = express.Router();

router.use('/u', require('./app.route'));
router.use('/user', require('./user.route'));
router.use('/activity', require('./activity.route'));
router.use('/form', require('./form.route'));
module.exports = router;