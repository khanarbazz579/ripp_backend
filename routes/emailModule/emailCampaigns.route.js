const express = require('express');
const router = express.Router();
const passport = require('passport');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");
const strategy = require('../../middleware/passport');
passport.use(strategy);

const CreateCampaign = require('../../controllers/campaignController/create');
const GetCampaign = require('../../controllers/campaignController/get_list');
const GetCampaignById = require('../../controllers/campaignController/get_campaign_by_id');
const UpdateCampaign = require('../../controllers/campaignController/update_campaign');
const DeleteCampaign = require('../../controllers/campaignController/delete_campaign');
const GetAllStatusCount = require('../../controllers/campaignController/get_all_status');
const GetEmailTemplateList = require('../../controllers/campaignController/get_email_template');
const HardDeleteCampaign = require('../../controllers/campaignController/hard_delete_campaign');

const { can } = require('../../middleware/CheckAccessMiddleware');

router.post('/', passport.authenticate('jwt', { session: false }), can(['emails', 'campaigns', 'add campaign']), CreateCampaign.create);
router.get('/get_all/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['emails', 'campaigns']), GetCampaign.getList);
router.get('/:id', passport.authenticate('jwt', { session: false }), can(['emails', 'campaigns']), GetCampaignById.get_campaign_byid);
router.get('/email_template/:type/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['emails', 'campaigns']), GetEmailTemplateList.fetchAll);
router.put('/update/:id', passport.authenticate('jwt', { session: false }), can(['emails', 'campaigns', 'edit campaign']), UpdateCampaign.update);
router.post('/delete', passport.authenticate('jwt', { session: false }), can(['emails', 'campaigns', 'delete campaign']), DeleteCampaign.remove);
router.get('/get_status_count/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), GetAllStatusCount.get_status);
router.post('/hardDelete', passport.authenticate('jwt', { session: false }),HardDeleteCampaign.hardDelete);

module.exports = router;