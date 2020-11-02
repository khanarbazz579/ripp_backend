const express = require('express');
const router = express.Router();
const { get, create, getAll, update, getUsers, getInitData, destroy } = require('../../controllers/analyticsController/form.controller');
const { getForm, updateFormMappings, saveFormValues } = require('../../controllers/analyticsController/public.controller');

const passport = require('passport');
const strategy = require('../../middleware/passport');
passport.use(strategy)

const { can } = require('../../middleware/CheckAccessMiddleware');

router.post('/', passport.authenticate('jwt', { session: false }), create);
router.put('/:id', passport.authenticate('jwt', { session: false }), update);
router.delete('/:id', passport.authenticate('jwt', { session: false }), destroy);
router.get('/all', passport.authenticate('jwt', { session: false }), getAll);
router.get('/o/user', passport.authenticate('jwt', { session: false }), getUsers);
router.get('/o/init', passport.authenticate('jwt', { session: false }), getInitData);

/**
 * Public APIS
 */
router.get('/p', getForm);
router.put('/p/:id', updateFormMappings);
router.post('/p/save', saveFormValues);

// router.get('/:id?', get);
module.exports = router;