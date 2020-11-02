const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('../../middleware/passport');
passport.use(strategy);

//Custom Field 
const AddCustomFieldController = require('../../controllers/customFieldController/createCustomField');
const GetAllFieldsController = require('../../controllers/customFieldController/getAllFields');
const UpdateCustomFieldAttibute = require('../../controllers/customFieldController/updateCustomFieldAttribute');
const { getSectionsWithAttribute } = require('../../controllers/customFieldController/getAllSectionsWithCustomFields');
const { haveRole } = require('../../middleware/CheckAccessMiddleware');
const { PERMISSIONS: { ROLES } } = require('../../constants');
// custom field
router.post('/customField', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), AddCustomFieldController.create);
router.get('/customFields/:type', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), GetAllFieldsController.getAll);
router.post('/updateCustomFieldAttibute', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), UpdateCustomFieldAttibute.updateCustomFieldAttibute)
router.get('/getSectionsWithAttribute/:type', passport.authenticate('jwt', { session: false }), getSectionsWithAttribute);

//Custom fields adjustments
router.use('/fieldAdjustments', require('./fieldAdjustments'))

module.exports = router;