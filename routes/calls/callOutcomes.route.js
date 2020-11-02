const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('../../middleware/passport');
passport.use(strategy);

const CallOutcomeController = require('../../controllers/callOutcomesController');
const { can } = require('../../middleware/CheckAccessMiddleware');

router.post('/', passport.authenticate('jwt', { session: false }), can(['calls', 'add call']), CallOutcomeController.create);
router.get('/', passport.authenticate('jwt', { session: false }), can(['calls']), CallOutcomeController.getAll);
router.put('/:id', passport.authenticate('jwt', { session: false }), can(['calls', 'edit-call']), CallOutcomeController.update);
router.put('/callOutcomebulkUpdate', passport.authenticate('jwt', { session: false }), can(['calls', 'edit call']), CallOutcomeController.bulkUpdate);
router.delete('/:id', passport.authenticate('jwt', { session: false }), can(['calls', 'delete call']), CallOutcomeController.remove);
router.post('/callOutcomeTransition', passport.authenticate('jwt', { session: false }), can(['calls', 'add call']), CallOutcomeController.createCallOutcomeTransition);

module.exports = router;