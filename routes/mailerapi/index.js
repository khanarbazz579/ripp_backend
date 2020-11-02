const express = require('express');
const passport = require('passport');
const { outlookMailerController, googleMailerController } = require('./../../controllers/mailerController/');
const Validatore = require('./../../helpers/validatore');
const { callControllerMethod } = require('./../../middleware/mailerMiddleare');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");

const router = express.Router();
const strategy = require('./../../middleware/passport');
passport.use(strategy);

const EmailSyncController = require('./../../controllers/emailSyncController');

/**
 * After send authontication request to Microsoft server with
 * scopes microsoft server redirect on this route with parameters and tokens
 * in this route validate provided auth code is valid or not.
 * If valid then generate auth token and store in database. otherwise send error response.
 * @module router
 * @method authorize
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.code {String} {Code that's returns from Microsoft server in query string.}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.get('/authorize', outlookMailerController.authorize);

/**
 * After send authontication request to google server with
 * scopes google server redirect on this route with parameters and tokens
 * in this route validate provided auth code is valid or not.
 * If valid then generate auth token and store in database. otherwise send error response.
 * @module router
 * @method googleAuthorize
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.code {String} {Code that's returns from google server in query string.}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.get('/googleAuthorize', googleMailerController.googleAuthorize);

/**
 * getMail is responsible for fetch folder wise emails from mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for fetch emails. Otherwise send error response.
 * @module router
 * @method getMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.folder_id {String} {Optional}
 * @param req.limit {Number} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.get('/getMail/:data', convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), callControllerMethod('getMail'));


/**
 * getFolders is responsible for fetch all types of email folders from mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for fetch email folders. Otherwise send error response.
 * @module router
 * @method getFolders
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.get('/getMailToSelectAll/:data', convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), googleMailerController.getMailToSelectAll);
router.post('/getMailToSelectAllForOutlook', passport.authenticate('jwt', { session: false }), outlookMailerController.getMailToSelectAllForOutlook);

router.get('/getFolders/:data', convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), callControllerMethod('getFolders'));
router.post('/getFoldersMailCount', passport.authenticate('jwt', { session: false }), outlookMailerController.getFoldersMailCount);


/**
 * moveOrCopyMail is responsible for move or copy perticular email by unique id on mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for move or copy email. Otherwise send error response.
 * @module router
 * @method moveOrCopyMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.destination_id {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.post('/moveOrCopyMail', passport.authenticate('jwt', { session: false }), callControllerMethod('moveOrCopyMail'));

/**
 * updateMail is responsible for update perticular email by unique id on mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for update email. Otherwise send error response.
 * @module router
 * @method updateMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param req.isRead {Boolean} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.post('/updateMail', passport.authenticate('jwt', { session: false }), callControllerMethod('updateMail'));

router.post('/updateMailArchived', passport.authenticate('jwt', { session: false }), googleMailerController.updateMailArchived);
/**
 * getMailById is responsible for fetch perticular email by unique id from mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for fetch email. Otherwise send error response.
 * @module router
 * @method getMailById
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.post('/getMailById', passport.authenticate('jwt', { session: false }), callControllerMethod('getMailById'));

/**
 * sendMail is responsible for send email with attachment or without attachment by mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for send email. Otherwise send error response.
 * @module router
 * @method sendMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Required}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.post('/sendMail', passport.authenticate('jwt', { session: false }), Validatore.validateSendMail, callControllerMethod('sendMail'));

/**
 * saveDraft is responsible for save  email with attachment or without attachment by mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for save email. Otherwise send error response.
 * @module router
 * @method saveDraft
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Optional}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.post('/saveDraft', passport.authenticate('jwt', { session: false }), Validatore.validateCreateMail, callControllerMethod('saveDraft'));

/**
 * replayMail is responsible for send reply email with attachment or without attachment by mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for send reply email. Otherwise send error response.
 * @module router
 * @method replayMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Required}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param req.mail.comment {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.post('/replayMail', passport.authenticate('jwt', { session: false }), Validatore.validateReplySendMail, callControllerMethod('replayMail'));

/**
 * createReplyMail is responsible for create reply email with attachment or without attachment by mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for save reply email. Otherwise send error response.
 * @module router
 * @method createReplyMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Required}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param req.mail.comment {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.post('/createReplyMail', passport.authenticate('jwt', { session: false }), Validatore.validateReplyCreateMail, callControllerMethod('createReplyMail'));

/**
 * getAttachment is responsible for get attachment from mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for fetch email attachment. Otherwise send error response.
 * @module router
 * @method getAttachment
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
router.post('/getAttachment', passport.authenticate('jwt', { session: false }), callControllerMethod('getAttachment'));

router.post('/getAttachmentWithContentBytes', passport.authenticate('jwt', { session: false }), callControllerMethod('getAttachmentWithContentBytes'))

router.post('/getAttachmentToGetContentData', passport.authenticate('jwt', { session: false }), callControllerMethod('getAttachmentToGetContentData'))
/**
 * forwordMail is responsible for forword email with attachment or without attachment by mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for forword email. Otherwise send error response.
 * @module router
 * @method forwordMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Required}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param req.mail.comment {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
router.post('/forwordMail', passport.authenticate('jwt', { session: false }), Validatore.validateReplySendMail, callControllerMethod('forwordMail'));

/**
 * searchMail is responsible for search email by query params from mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for search emails. Otherwise send error response.
 * @module router
 * @method searchMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.search_text {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
router.get('/searchMail/:data', convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), callControllerMethod('searchMail'));

/**
 * generateRequest is responsible for create authontication request.
 * @module router
 * @method generateRequest
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
router.post('/generateRequest', passport.authenticate('jwt', { session: false }), Validatore.generateRequest, callControllerMethod('generateRequest'));

router.get('/googlerefresh', googleMailerController.refresh);
router.get('/outlookrefresh', outlookMailerController.refresh);


/** To send email to selected users **/
router.post('/sendTrackableMail', passport.authenticate('jwt', { session: false }), EmailSyncController.sendEmail);


router.get('/:id/tracker.png', EmailSyncController.trackEmail);

/** To download attachment **/
router.post('/downloadAttachment', passport.authenticate('jwt', { session: false }), EmailSyncController.downloadAttachment);


module.exports = router;