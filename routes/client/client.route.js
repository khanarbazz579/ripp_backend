const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
passport.use(strategy);
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");

const ClientController = require('./../../controllers/leadController/LeadController');
const GetleadFilterData = require('./../../controllers/leadController/getleadFilterData');
const GetLeadController = require('./../../controllers/leadController/getLead');
const { haveRole, can } = require('../../middleware/CheckAccessMiddleware');

// Client
router.post('/', passport.authenticate('jwt', { session: false }), can(['clients', 'add new clients']), ClientController.create);                        
router.get('/getAll', passport.authenticate('jwt', { session: false }), can(['clients']), ClientController.getAll);                   
router.put('/update/:lead_id', passport.authenticate('jwt', { session: false }), can(['clients', 'edit clients']), ClientController.update);          
router.delete('/:lead_id', passport.authenticate('jwt', { session: false }), can(['clients', 'delete clients', 'single client delete']), ClientController.remove);  			
router.get('/get/:lead_id', passport.authenticate('jwt', { session: false }), can(['clients']), GetLeadController.get); 				
router.get('/filterdata/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['clients']), GetleadFilterData.getleadFilterData);
router.put('/bulkUpdate', passport.authenticate('jwt', { session: false }), can(['clients', 'edit clients']), ClientController.bulkUpdate);  
router.post('/bulkRemove', passport.authenticate('jwt', { session: false }), can(['clients', 'delete clients', 'multiple client delete']), ClientController.LeadBulkRemove); 

module.exports = router;