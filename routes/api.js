const express = require('express');
const router = express.Router();
const { can } = require('./../middleware/CheckAccessMiddleware');
const convertStringToObject = require("../middleware/ConvertBase64ToObject");
// User
const CreateUser = require('./../controllers/userController/createUser');
// const GetUser = require('./../controllers/userController/getUser');
// const UpdateUser = require('./../controllers/userController/updateUser');
// const RemoveUser = require('./../controllers/userController/removeUser');
const getUserDetail = require('./../controllers/userController/getUserDetail');
// Auth
const ForgetPassword = require('./../controllers/authController/forgetPassword');
const Login = require('./../controllers/authController/login');
const ResetPassword = require('./../controllers/authController/resetPassword');

// leads
const Leads = require('./leads/leads.route');

// Client
const Clients = require('./client/client.route');

// Timezone
const Timezone = require('./timezone/timzone.route');

// meeting Room route
const MeetingRoom = require('./meeting-room/meetingRoom.route');

// file category route
const FileCategory = require('./file-category/fileCategory.route');

const UploadSingleImageController = require('./../controllers/leadController/uploadLeadImage');
const RemoveSingleImageController = require('./../controllers/leadController/removeLeadImage');

const UpdateLeadDetail = require('./../controllers/leadController/updateLeadDetail');
const UpdateContactController = require('./../controllers/leadController/updateCompanyContact');

//History
const CreateHistoryController = require('./../controllers/historyController/createHistory');
const UpdateHistoryController = require('./../controllers/historyController/updateHistory');
const DeleteHistoryController = require('./../controllers/historyController/deleteHistory');
const GetLeadHistoryController = require('./../controllers/historyController/getLeadHistory');

// Country
const GetAllCountryController = require('./../controllers/countryController/getAllCountries');
const GetAllCurrencyController = require('./../controllers/currencyController/getAllCurrencies');

// Note
const CreateNoteController = require('./../controllers/noteController/createNote');

// Media
const Media = require('./media/index')

// Entity Media
const EntityMedia = require('./entity-media/entityMedia.route')

// sale stage
const SaleStage = require('./sales-stages/salesStage.route');

// default add new form fields 
const FromDefaultFields = require('./form-default-fields/fromDefaultFields.route');

// Suppliers 
const Suppliers = require('./supplier/supplier.route');

// CustomFilter 
const CustomFilter = require('./custom-filter/customFilter.route');

//Event API
const event = require('./eventapi');

//Todo API
const todo = require('./todoapi');

//Custom Date Range API
const CustomDateRange = require('./todoapi/customDateRange.route');

//Mailbox API
const mailer = require('./mailerapi');

//Notifications
const Notifications = require('./notification/notification.route');

//cron
const StartEmailCron = require('./../controllers/CronJobController/startEmailCron');

// const EmailListRoute = require('./emailModule/emailList.route');

const passport = require('passport');
const path = require('path');

// Daily Quotes details
const getDailyQuotes = require('../controllers/dailyQuoteController/getDailyQuote');

//Add company information in ACCOUNTS TABLE.
const AddCompanyInformation = require('../controllers/companyInformationController/addCompanyInformation');

//Get company Information from Accounts Table 
const GetCompanyInformation = require('../controllers/companyInformationController/getCompanyInformation');
const strategy = require('./../middleware/passport');

const multerS3ProfileUpload = require('../services/multerS3UserProfile');
// const multerS3Service = require('../services/multerS3Service');
const MultipleUpload = require('./multiple-upload/multipleUpload.route');
// authentications
passport.use(strategy);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({ status: "success", message: "Parcel Pending API", data: { "version_number": "v1.0.0" } })
});

//User
router.post('/users', CreateUser.create); // C
// router.get('/users', passport.authenticate('jwt', { session: false }), GetUser.get); // R
// router.put('/users/:id',
//     passport.authenticate('jwt', { session: false }),
//     multerS3ProfileUpload.uploadProfileImageToAws,
//     UpdateUser.update); // U
// router.delete('/users/:id', passport.authenticate('jwt', { session: false }), RemoveUser.remove); // D
router.get('/user/detail/:type', passport.authenticate('jwt', { session: false }), getUserDetail.getUserDetail);
// R

// Daily Quotes 
router.get('/dailyQuote/:data',convertStringToObject.base64ToString,getDailyQuotes.getDailyQuotes);

//Add Company Information in Accounts table
router.post('/company/addInformation',passport.authenticate('jwt',{session:false}),AddCompanyInformation.addCompanyInformationData);

//Get Company Information from Accounts Table
router.get('/company/getInformation/:id',passport.authenticate('jwt',{session:false}),GetCompanyInformation.getCompanyInformationData)

//Auth
router.post('/users/login', Login.login);
router.post('/users/verify_authentication', Login.verifyAuthentication);
router.post('/forgetPassword', ForgetPassword.forgot);
router.post('/resetPassword', ResetPassword.resetPassword);


router.post('/uploadImage', passport.authenticate('jwt', { session: false }), multerS3ProfileUpload.uploadProfileImageToAws, UploadSingleImageController.uploadLeadImage);
router.put('/removeImage/:contact_id', passport.authenticate('jwt', { session: false }), multerS3ProfileUpload.uploadProfileImageToAws, RemoveSingleImageController.removeLeadImage);
router.put('/updateLeadDetail/:lead_id', passport.authenticate('jwt', { session: false }), UpdateLeadDetail.update);
router.post('/updateCompanyContact', passport.authenticate('jwt', { session: false }), multerS3ProfileUpload.uploadProfileImageToAws, UpdateContactController.update);

// media routing
router.use('/', Media);

// entity media routing
router.use('/entityMedia', EntityMedia);

//note
router.post('/note', passport.authenticate('jwt', { session: false }), CreateNoteController.create);

// event
router.use('/event', event);

// todo
router.use('/todo', todo);

// custom date range
router.use('/customDateRange', CustomDateRange);

// history
router.post('/history', passport.authenticate('jwt', { session: false }), CreateHistoryController.create);
router.put('/history/:history_id', passport.authenticate('jwt', { session: false }), UpdateHistoryController.update);
router.delete('/history/:history_id', passport.authenticate('jwt', { session: false }), DeleteHistoryController.remove);
router.get('/leadHistory/:lead_id', passport.authenticate('jwt', { session: false }), can(['leads', 'leads activity history']), GetLeadHistoryController.get);
router.get('/contactHistory/:contact_id', passport.authenticate('jwt', { session: false }), GetLeadHistoryController.get);

// Countries
router.get('/countries', passport.authenticate('jwt', { session: false }), GetAllCountryController.getAll);
router.get('/currencies', passport.authenticate('jwt', { session: false }), GetAllCurrencyController.getAll);


// custom field
router.use(require('./custom-fields'));

// meeting room 
router.use('/meetingRoom', MeetingRoom);

// file category 
router.use('/fileCategory', FileCategory);

//Sale stage
router.use('/saleStage', SaleStage);

//form default fields
router.use('/defaultFields', FromDefaultFields);

//lead routes
router.use('/lead', Leads);

//client routes
router.use('/client', Clients);

// timzone Routes
router.use('/timezone', Timezone);

// Supplier 
router.use('/supplier', Suppliers);

//custom filter
router.use('/customFilter', CustomFilter);

//notification
router.use('/notification', Notifications);

router.use('/permissions', require('./permissions'))

/**
 * multiple lead upload
 */
router.use('/multipleUpload', MultipleUpload);

//Start route for mailbox
router.use('/mailer', mailer);

//Cron
router.post('/ready_cron', passport.authenticate('jwt', { session: false }), StartEmailCron.ready);
router.post('/scheduled_cron', passport.authenticate('jwt', { session: false }), StartEmailCron.scheduled);


// Shared Link Guest User routes
router.use('/sharedLink', require('./shared-link'));
router.use('/sharedata', require('./shared-link/file-folder-sharing'));
/**
 * User routes
 */
router.use('/user', require('./user'));

router.use(require('./calls'));
router.use(require('./emailModule'))
router.use(require('./email-inbox'))
router.use('/role-access', require('./role-access'))


/**
 * Public routes for analytics module
 * Should work calling from external URIs
 */
router.use('/rta', require('./analytics'))


module.exports = router;