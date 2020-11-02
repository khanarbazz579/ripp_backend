const express = require('express');
const router = express.Router();
const CreateDefaultFields = require('./../../controllers/defaultFieldController/createDefaultField');
const UpdateDefaultFields = require('./../../controllers/defaultFieldController/updateDefaultField');
const GetDefaultFields = require('./../../controllers/defaultFieldController/getDefaultField');
const DeleteDefaultFields = require('./../../controllers/defaultFieldController/deleteDefaultField');

const passport = require('passport');
const strategy = require('./../../middleware/passport');
passport.use(strategy);
const { PERMISSIONS: { ROLES } } = require('../../constants');
const { haveRole } = require('../../middleware/CheckAccessMiddleware');

router.post('/', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), CreateDefaultFields.create);  // create
router.put('/:id', passport.authenticate('jwt', { session: false }), UpdateDefaultFields.update);  // update
router.get('/', passport.authenticate('jwt', { session: false }), GetDefaultFields.getAll);  // get all form default fields
router.get('/extraCustomFields/:type', passport.authenticate('jwt', { session: false }), GetDefaultFields.getExtraCustomFields);  // get form custom  fields of particular extra type
router.get('/:type', passport.authenticate('jwt', { session: false }), GetDefaultFields.get);  // get form default fields of particular type
router.delete('/:id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), DeleteDefaultFields.remove);  // delete
router.post('/bulkUpdate', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), UpdateDefaultFields.bulkUpdate);  // bulk update

module.exports = router;