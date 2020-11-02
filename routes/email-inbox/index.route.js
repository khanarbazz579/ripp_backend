const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
const multerS3ProfileUpload = require('./../../services/multerS3UserProfile');

passport.use(strategy);

// Email Provider 
const emailProvidersController = require("../../controllers/emailProvidersController/emailProvidersController");
const emailUsersController = require("../../controllers/emailUsersController/emailUsersController");
const { can } = require('../../middleware/CheckAccessMiddleware');

//Email Provider
router.get('/getEmailProviders', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailProvidersController.getAll);
router.post('/createProviders', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailProvidersController.createProvider);
router.put('/updateProviders/:id', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailProvidersController.updateProviders);
router.delete('/deleteProviders/:id', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailProvidersController.deleteProviders);
router.delete('/deleteEMailIDWAsProvidersDelete/:id', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailProvidersController.deleteEMailIDWAsProvidersDelete);


//Email User
router.get('/getEmailUsers', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailUsersController.getAll);
router.post('/createEmailUsers', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailUsersController.createEmailUsers);
router.put('/updateEmailUsers/:id', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailUsersController.updateEmailUsers);
router.delete('/deleteEmailUsers/:id', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailUsersController.deleteEmailUsers);
router.get('/getEmailUsersByIdOf/:id', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailUsersController.getEmailUserByID);


//Upload email user signature file. 
router.post('/createEmailSignature', passport.authenticate('jwt', { session: false }), can(['email inbox']), multerS3ProfileUpload.uploadSignatureFileToAWS, emailUsersController.createEmailSignature);

//To get email signature. 
router.get('/getAllFile', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailUsersController.getAllFile);
router.delete('/deleteSignatureFile/:id', passport.authenticate('jwt', { session: false }), can(['email inbox']), emailUsersController.deleteSignatureFile);


module.exports = router;