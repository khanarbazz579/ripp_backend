const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');

const multerS3ProfileUpload = require('../../services/multerS3UserProfile');
const { PERMISSIONS: { ROLES } } = require('../../constants');
const { haveRole, can } = require('../../middleware/CheckAccessMiddleware');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");

passport.use(strategy);

const LeadController = require('./../../controllers/leadController/LeadController');
const GetleadFilterData = require('./../../controllers/leadController/getleadFilterData');
const GetlSearchedLeadData = require('./../../controllers/leadController/getSearchedLead');
const LostLeadIdentifierController = require('./../../controllers/leadController/lostLeadIdentifier');
const LostLeadPercentage = require('./../../controllers/leadController/LostLeadPercentage');
const LostLeadFieldController = require('./../../controllers/leadController/lostLeadFields');
const LeadAnalytics = require('./../../controllers/leadController/LeadAnalytics');
const GetLeadController = require('./../../controllers/leadController/getLead');

// Lead
router.post('/', passport.authenticate('jwt', { session: false }), can(['leads', 'add new leads']), LeadController.create);
router.get('/filterdata/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['leads']), GetleadFilterData.getleadFilterData);
router.get('/searchData/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['leads']), GetlSearchedLeadData.getSearchLeadData);
router.put('/update/:lead_id', passport.authenticate('jwt', { session: false }), can(['leads', 'edit leads']), LeadController.update);
router.delete('/:lead_id', passport.authenticate('jwt', { session: false }), can(['leads', 'delete leads', 'single lead delete']), LeadController.remove);
router.get('/get/:lead_id', passport.authenticate('jwt', { session: false }), can(['leads']), GetLeadController.get);
router.post('/bulkRemove', passport.authenticate('jwt', { session: false }), can(['leads', 'delete leads', 'multiple lead delete']), LeadController.LeadBulkRemove);
router.put('/bulkUpdate', passport.authenticate('jwt', { session: false }), can(['leads', 'edit leads']), LeadController.bulkUpdate);
router.get('/getAll', passport.authenticate('jwt', { session: false }), can(['leads']), LeadController.getAll);
router.put('/transferContact', passport.authenticate('jwt', { session: false }), can(['leads', 'edit leads']), LeadController.transferContact);
router.post('/addContact', passport.authenticate('jwt', { session: false }), can(['leads', 'add new contact']), LeadController.addContact);


// Lead Analitics 
router.get('/convertionGraph/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['leads']), LeadAnalytics.getConvertionGraph);
router.get('/lostLeadGraph/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['leads']), LeadAnalytics.getLostLeadGraph);
router.get('/totalTimeTOConvert/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['leads']), LeadAnalytics.getTotaldayToConvert);
router.get('/stageTransistionGraph/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['leads']), LeadAnalytics.getStageTransistionGraph);
router.get('/lostLeadPercentage', passport.authenticate('jwt', { session: false }), can(['leads']), LostLeadPercentage.getLostPercentage);

// Lost Lead Identifier
router.post('/lostLeadIdentifier', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), LostLeadIdentifierController.create);  // create
router.put('/lostLeadIdentifier/:id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), LostLeadIdentifierController.update);  // update
router.get('/lostLeadIdentifier', passport.authenticate('jwt', { session: false }), LostLeadIdentifierController.getAll);  // get All
router.delete('/lostLeadIdentifier/:id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), LostLeadIdentifierController.remove);  // delete


router.post('/lostLeadField', passport.authenticate('jwt', { session: false }), LostLeadFieldController.create);  // create filds for lost lead to identify the identfiers

router.use('/sharing', require('./recordSharing.route'));

module.exports = router;