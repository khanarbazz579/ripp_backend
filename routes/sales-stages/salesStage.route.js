const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
passport.use(strategy);
const { PERMISSIONS: { ROLES } } = require('../../constants');
const { haveRole } = require('../../middleware/CheckAccessMiddleware');

const CreateSaleStage = require('./../../controllers/saleStages/createSaleStage');
const UpdateSaleStage = require('./../../controllers/saleStages/updateSaleStage');
const GetSaleStage = require('./../../controllers/saleStages/getSaleStages');
const DeleteSaleStage = require('./../../controllers/saleStages/deleteSaleStage');
const CreateOrUpdateCheckes = require('./../../controllers/saleStages/stageCheckStatus');

router.post('/', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), CreateSaleStage.create);  // create
router.put('/:id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), UpdateSaleStage.update);  // update
router.post('/bulkUpdate', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), UpdateSaleStage.bulkUpdate);  // bulk update
router.get('/:type', passport.authenticate('jwt', { session: false }), GetSaleStage.getAll);  // get All sales stages
router.delete('/:id', passport.authenticate('jwt', { session: false }), haveRole(ROLES.ADMIN), DeleteSaleStage.remove);  // delete
router.post('/setCheckStatus', passport.authenticate('jwt', { session: false }), CreateOrUpdateCheckes.createOrUpdate); // API for creating is-check sales stage value or updating if already exists.

module.exports = router;