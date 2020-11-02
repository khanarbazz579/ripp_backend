const express = require('express');
const router = express.Router();
const passport = require('passport');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");
const strategy = require('../../middleware/passport');
passport.use(strategy);

const GlobalNotificationController = require('../../controllers/notificationController/updateGlobalNotificationSettings');
const GetAllGlobalNotificationController = require('./../../controllers/notificationController/getAllGlobalNotificationSettings');
const GetAllNotificationController = require('../../controllers/notificationController/getAllNotifications');
const UpdateNotificationController = require('../../controllers/notificationController/updateNotification');
const BulkUpdateNotificationController = require('../../controllers/notificationController/bulkUpdateNotification');
const NotificationReadController = require('../../controllers/notificationController/getNotificationReadStatus');
const GetGlobalNotificationController = require('./../../controllers/notificationController/getGlobalNotificationSettings');
//const CronNotificationController = require('../../controllers/CronJobController/triggerNotifications');

const { PERMISSIONS: { ROLES } } = require('../../constants');
const { haveRole } = require('../../middleware/CheckAccessMiddleware');

router.put('/globalNotificationSetting/:type', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), GlobalNotificationController.update);
router.get('/globalNotificationSettings', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), GetAllGlobalNotificationController.getAll);
router.get('/globalNotificationSetting/:type', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), GetGlobalNotificationController.get);
router.get('/getNotificationReadStatus', passport.authenticate('jwt', { session: false }), NotificationReadController.notificationReadStatus);
router.get('/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), GetAllNotificationController.getAll);
router.post('/', passport.authenticate('jwt', { session: false }), GetAllNotificationController.getAll);
router.put('/:id', passport.authenticate('jwt', { session: false }), UpdateNotificationController.update);
router.post('/bulkUpdateNotification', passport.authenticate('jwt', { session: false }), BulkUpdateNotificationController.bulkUpdate);
//router.post('/triggerNotifications', passport.authenticate('jwt', { session: false }), CronNotificationController.allNotifications);

//File notification detail api's
const FileNotificationDetailController = require('../../controllers/fileNotificationDetailController');

router.post('/createFileNotification', passport.authenticate('jwt', { session: false }), FileNotificationDetailController.create);
router.put('/updateFileNotification/:id', passport.authenticate('jwt', { session: false }), FileNotificationDetailController.update);
router.get('/fileNotifications/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), FileNotificationDetailController.getAll);
router.post('/fileNotifications', passport.authenticate('jwt', { session: false }), FileNotificationDetailController.getAll);
router.post('/bulkUpdateFileNotification', passport.authenticate('jwt', { session: false }), FileNotificationDetailController.bulkUpdate);
router.get('/getFileNotificationReadStatus', passport.authenticate('jwt', { session: false }), FileNotificationDetailController.getFileNotificationReadStatus);

module.exports = router;

