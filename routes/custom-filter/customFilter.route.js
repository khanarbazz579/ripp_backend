const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('./../../middleware/passport');

passport.use(strategy);

// Custom Filter
const CreateCustomFilter = require('./../../controllers/customFilterController/createCustomFilter');
const GetCustomFilter = require('./../../controllers/customFilterController/getCustomFilter');
const EditCustomFilter = require('./../../controllers/customFilterController/editCustomFilter');
const RemoveCustomFilter = require('./../../controllers/customFilterController/removeCustomFilter');
const GetCostomFieldWithAttr = require('./../../controllers/customFilterController/getCustomfieldsAttribute');


// custom filter
router.post('/', passport.authenticate('jwt', { session: false }), CreateCustomFilter.create); //Create
router.get('/:type', passport.authenticate('jwt', { session: false }), GetCustomFilter.getAll); // get
router.put('/', passport.authenticate('jwt', { session: false }), EditCustomFilter.edit) // edit
router.delete('/:id', passport.authenticate('jwt', { session: false }), RemoveCustomFilter.remove) // remove
router.put('/bulkUpdate', passport.authenticate('jwt', { session: false }), EditCustomFilter.bulkUpdate); // bulkUpdate
router.get('/customFieldsWithAttribute/:type', passport.authenticate('jwt', { session: false }), GetCostomFieldWithAttr.getFieldsWithAttribute);

module.exports = router;