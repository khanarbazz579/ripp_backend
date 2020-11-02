const express = require('express');
const router = express.Router();

const SharedGuest = require('../../controllers/shareGuestController').shareGuestController;
const GuestAuth = require('../../controllers/shareGuestController').authController;

router.post('/login', GuestAuth.authenticate);
router.post('/forgotPassword', GuestAuth.forgetPassword);
router.post('/resetPassword', GuestAuth.resetPasswordAfterForgot);
router.post('/changePassword', GuestAuth.updatePassword);
router.post('/register', GuestAuth.register);
router.get('/verify/sharingToken', SharedGuest.verifySharingToken);
router.post('/resendEmail', SharedGuest.resendEmail);
router.put('/update/:id', SharedGuest.update)
// router.get('/:id', SharedGuest.getById)
// router.get('/', SharedGuest.get)

module.exports = router;