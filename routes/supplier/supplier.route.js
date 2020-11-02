const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');
passport.use(strategy);
const multerS3ProfileUpload = require('../../services/multerS3UserProfile');
const { can } = require('../../middleware/CheckAccessMiddleware');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");

const CreateSuppliers = require('./../../controllers/supplierController/createSupplier');
const UpdateSupplier = require('./../../controllers/supplierController/updateSupplier');

const GetSupplier = require('./../../controllers/supplierController/createSupplier');
const RemoveSupplier = require('./../../controllers/supplierController/createSupplier');
const BulkRemove = require('./../../controllers/supplierController/createSupplier');
const BulkUpdate = require('./../../controllers/supplierController/createSupplier');

const GetSuppliers = require('./../../controllers/supplierController/getSupplier');
const GetSupplierFilterData = require('./../../controllers/supplierController/getSupplierFilterData');
const SupplierDetailContoller = require('./../../controllers/supplierController/supplierDetail');
const CreateSupplierAdditionalController = require('./../../controllers/supplierController/createSupplierAdditional');

router.post('/', passport.authenticate('jwt', { session: false }), can(['suppliers', 'add new suppliers']), CreateSuppliers.create);
router.put('/:id', passport.authenticate('jwt', { session: false }), can(['suppliers' , 'edit suppliers']), UpdateSupplier.update);
router.get('/count', passport.authenticate('jwt', { session: false }), can(['suppliers']), GetSuppliers.getCount);
router.get('/', passport.authenticate('jwt', { session: false }), can(['suppliers']), GetSuppliers.getAll);
router.get('/filterData/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['suppliers']), GetSupplierFilterData.getSupplierFilterData); // filtering supplier value
router.post('/detail', passport.authenticate('jwt', { session: false }), can(['suppliers', 'add new suppliers']), multerS3ProfileUpload.uploadProfileImageToAws, SupplierDetailContoller.supplierDetail);
router.post('/additional', passport.authenticate('jwt', { session: false }), can(['suppliers']), CreateSupplierAdditionalController.create);

router.get('/:id', passport.authenticate('jwt', { session: false }), can(['suppliers']), GetSupplier.create);
router.delete('/:id', passport.authenticate('jwt', { session: false }), can(['suppliers', 'delete suppliers']), RemoveSupplier.create);
router.post('/bulkRemove', passport.authenticate('jwt', { session: false }), can(['suppliers', 'delete suppliers']), BulkRemove.create);
router.put('/bulkUpdate', passport.authenticate('jwt', { session: false }), can(['suppliers', 'add new suppliers']), BulkUpdate.create);

module.exports = router;