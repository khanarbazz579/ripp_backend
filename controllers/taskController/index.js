const CreateTaskController = require('./createTask'); 
const UpdateTaskController = require('./updateTask');
const DeleteTaskController = require('./deleteTask');
const GetTaskController = require('./getTask');
const GetAllTaskController = require('./getAllTask');
const BulkUpdateTaskController = require('./bulkUpdateTask');
const GetTaskCountController = require('./getTaskCount');
const FilterDataController = require('./getLeadSupplierFilteredList');
const UpdateTaskAdditionalController = require('./updateTaskAdditional');
const BulkSwitchUpdate = require('./bulkSwitchUpdate');
const CreateCallListController = require('./callListController'); 

module.exports = {
	createTask: CreateTaskController.create,
	updateTask: UpdateTaskAdditionalController.update,
	getTask: GetTaskController.get,
	updateTask: UpdateTaskController.update,
	deleteTask: DeleteTaskController.remove,
	getAllTask: GetAllTaskController.allTasks,
	bulkUpdateTask: BulkUpdateTaskController.bulkUpdate,
	getTaskCount: GetTaskCountController.getTaskCount,
	getList: FilterDataController.getList,
	bulkSwitchUpdate: BulkSwitchUpdate.bulkSwitchUpdate,
	createCallList : CreateCallListController.createCallList
}

