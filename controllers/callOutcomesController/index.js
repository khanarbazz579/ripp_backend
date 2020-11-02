const CreateCallOutcomeController = require('../../controllers/callOutcomesController/createCallOutcome');
const GetAllCallOutcomeController = require('../../controllers/callOutcomesController/getAllCallOutcome');
const UpdateCallOutcomeController = require('../../controllers/callOutcomesController/updateCallOutcome').update;
const BulkUpdateCallOutcomeController = require('../../controllers/callOutcomesController/updateCallOutcome').bulkUpdate;
const RemoveCallOutcomeController = require('../../controllers/callOutcomesController/removeCallOutcome');
const CreateCallOutcomeTransitionController = require('../../controllers/callOutcomesController/createCallOutcomeTransition');

module.exports = {
	create : CreateCallOutcomeController.create,
	getAll : GetAllCallOutcomeController.getAll,
	update : UpdateCallOutcomeController,
	bulkUpdate : BulkUpdateCallOutcomeController,
	remove : RemoveCallOutcomeController.remove,
	createCallOutcomeTransition : CreateCallOutcomeTransitionController.create,
}