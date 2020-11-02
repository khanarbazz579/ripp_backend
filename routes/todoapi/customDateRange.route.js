const express = require('express');
const passport = require('passport');
const CustomDateRangeController = require('../../controllers/todoController/CustomDateRangeController');

const router = express.Router();
const strategy = require('./../../middleware/passport');
passport.use(strategy);


router.post('/create', passport.authenticate('jwt', { session: false }),  CustomDateRangeController.create);
router.put('/update/:id', passport.authenticate('jwt', { session: false }),  CustomDateRangeController.update);
router.get('/get/:type', passport.authenticate('jwt', { session: false }),  CustomDateRangeController.get);

module.exports = router;


