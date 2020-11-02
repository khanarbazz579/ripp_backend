const express = require('express');
const passport = require('passport');
const router = express.Router();
const strategy = require('./../../middleware/passport');
passport.use(strategy);
const downloadFileStrategy = require('../../middleware/downloadFileStrategyPassport');
passport.use('download-file-rule', downloadFileStrategy);
const entityMediaController = require('./../../controllers/entityMediaController');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");

router.post('/upload', passport.authenticate('jwt', { session: false }), entityMediaController.upload);
router.get('/allFiles/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), entityMediaController.getAll);
router.post('/update', passport.authenticate('jwt', { session: false }), entityMediaController.update);
router.post('/updateAssociateContact', passport.authenticate('jwt', { session: false }), entityMediaController.updateAssociateContact);
router.get('/getFilePreview/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), entityMediaController.getImagePreview);
router.get('/blob/:id', passport.authenticate('download-file-rule', { session: false }), entityMediaController.getFileBlob);
router.post('/sharePreparingZip', passport.authenticate('jwt', { session: false }), entityMediaController.sharePreparingZip);
router.get('/download/zipped/:filename/', passport.authenticate('download-file-rule', { session: false }), entityMediaController.downloadZip);
router.post('/remove', passport.authenticate('jwt', { session: false }), entityMediaController.remove);
module.exports = router;

