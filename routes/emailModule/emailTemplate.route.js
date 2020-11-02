const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
const { CreateTemplate, UploadTemplateImage, FetchTemplates, DeleteTemplate, UpdateTemplate } = require('../../controllers/emailTemplate');
const multerS3Service = require('../../services/multerS3Service');
const { can } = require('../../middleware/CheckAccessMiddleware');

passport.use(strategy);

router.post('/template/create', passport.authenticate('jwt', { session: false }), can(['emails', 'templates', 'add templates']), CreateTemplate.create)
router.post('/template/upload/image', passport.authenticate('jwt', { session: false }), can(['emails', 'templates', 'add templates']), multerS3Service.uploadTemplateImage, UploadTemplateImage.uploadImage)
router.get('/templates/:type', passport.authenticate('jwt', { session: false }), can(['emails', 'templates']), FetchTemplates.fetchAll)
router.delete('/template/:id', passport.authenticate('jwt', { session: false }), can(['emails', 'templates', 'delete templates']), DeleteTemplate.remove)
router.get('/template/:id', passport.authenticate('jwt', { session: false }), can(['emails', 'templates']), FetchTemplates.fetchOne)
router.put('/template/:id', passport.authenticate('jwt', { session: false }), can(['emails', 'templates', 'edit templates']), UpdateTemplate.update)

module.exports = router;