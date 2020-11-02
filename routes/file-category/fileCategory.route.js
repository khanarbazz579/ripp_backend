const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
passport.use(strategy);

const FileCategoryController = require('../../controllers/fileCategoryController/fileCategoryController');

router.post('/', passport.authenticate('jwt', { session: false }), FileCategoryController.create);  // create
router.get('/', passport.authenticate('jwt', { session: false }), FileCategoryController.getAll); // getAll
router.put('/:id', passport.authenticate('jwt', { session: false }), FileCategoryController.update);  // update
router.delete('/:id', passport.authenticate('jwt', { session: false }), FileCategoryController.remove);  // remove

module.exports = router;