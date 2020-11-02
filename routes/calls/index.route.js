const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('../../middleware/passport');
const CreateTaskController = require('../../controllers/taskController/createTask');
const UpdateTaskController = require('../../controllers/taskController/updateTask');
const DeleteTaskController = require('../../controllers/taskController/deleteTask');
const GetTaskController = require('../../controllers/taskController/getTask');
const GetAllTaskController = require('../../controllers/taskController/getAllTask');
const BulkUpdateTaskController = require('../../controllers/taskController/bulkUpdateTask');
const GetTaskCountController = require('../../controllers/taskController/getTaskCount');
const FilterDataController = require('../../controllers/taskController/getLeadSupplierFilteredList');
const UpdateTaskAdditionalController = require('../../controllers/taskController/updateTaskAdditional');
const BulkSwitchUpdate = require('../../controllers/taskController/bulkSwitchUpdate');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");
const { createCallList, getFilterContactCount, getUserCallList, updateCallList,getFilterCallCount } = require('../../controllers/taskController/callListController');

passport.use(strategy);
const { can } = require('../../middleware/CheckAccessMiddleware');
const callOutcomes = require('./callOutcomes.route');

//Tasks
router.post('/tasks', passport.authenticate('jwt', { session: false }), can(['calls', 'add call']), CreateTaskController.create); //C 
router.get('/tasks/:task_id', passport.authenticate('jwt', { session: false }), can(['calls']), GetTaskController.get); //R
router.put('/tasks/:task_id', passport.authenticate('jwt', { session: false }), can(['calls', 'edit call']), UpdateTaskController.update); //U
router.post('/tasksDelete', passport.authenticate('jwt', { session: false }), can(['calls', 'delete call']), DeleteTaskController.remove); //D
router.get('/allTasks/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['calls']), GetAllTaskController.allTasks);
router.put('/bulkUpdate', passport.authenticate('jwt', { session: false }), can(['calls', 'edit call']), BulkUpdateTaskController.bulkUpdate);
router.get('/taskCount/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['calls']), GetTaskCountController.getTaskCount);

router.get('/getFilteredLeadSupplier/:search_term', passport.authenticate('jwt', { session: false }), can(['calls']), FilterDataController.getList);
router.post('/updateTaskAdditional', passport.authenticate('jwt', { session: false }), can(['calls', 'edit call']), UpdateTaskAdditionalController.update);
router.post('/bulkSwitchUpdate', passport.authenticate('jwt', { session: false }), can(['calls', 'edit call']), BulkSwitchUpdate.bulkSwitchUpdate);

router.get('/callList', passport.authenticate('jwt', { session: false }), getUserCallList);
router.post('/callList', passport.authenticate('jwt', { session: false }), can(['calls', 'add call']), createCallList);
router.get('/getFilterContactCount/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), getFilterContactCount);
router.get('/getFilterCallCount/:data',convertStringToObject.base64ToString, passport.authenticate('jwt',{session:false}), getFilterCallCount);
router.put('/callList', passport.authenticate('jwt', { session: false }), updateCallList);
router.delete('/callList/:id',passport.authenticate('jwt',{session:false}), deleteCallList);
router.use('/callOutcome', callOutcomes);

module.exports = router;