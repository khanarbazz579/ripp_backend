const express = require('express');
const passport = require('passport');
const TodoController = require('../../controllers/todoController/TodoController');

const router = express.Router();
const strategy = require('./../../middleware/passport');
passport.use(strategy);
const { can } = require('../../middleware/CheckAccessMiddleware');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");

router.post('/add-todo', passport.authenticate('jwt', { session: false }), can(['todo', 'add todo']), TodoController.create);
router.post('/edit-todo', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.edit);
router.post('/add-category', passport.authenticate('jwt', { session: false }), can(['todo', 'todo category', 'add todo category']), TodoController.createCategory);
router.post('/edit-category', passport.authenticate('jwt', { session: false }), can(['todo', 'todo category', 'edit todo category']), TodoController.editCategory);
router.get('/get-categories/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['todo', 'todo category']), TodoController.getCategories);
router.get('/get-todo-count/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['todo']), TodoController.getTodoCount);
router.get('/get-todos/:type/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['todo']), TodoController.getTodos);
router.put('/update-date/:todo_id', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.updateDate);
router.put('/update-priority/:todo_id', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.updatePriority);
router.put('/update-complete/:todo_id', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.updateComplete);
router.post('/bulk-update', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.bulkDelete);
router.post('/bulk-change-cat', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.bulkChangeCat);
router.post('/bulk-change-due-date', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.bulkChangeDueDate);
router.post('/bulk-mark-completed', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.bulkMarkCompleted);
router.post('/bulk-change-to-active', passport.authenticate('jwt', { session: false }), can(['todo', 'edit todo']), TodoController.bulkChangeToActive);
router.get('/get-category-todo/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['todo', 'todo category']), TodoController.getCategoryTodo);
router.post('/delete-category', passport.authenticate('jwt', { session: false }), can(['todo', 'todo category', 'delete todo category']), TodoController.deleteCategory);
router.get('/get-month-todos/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['todo']), TodoController.getMonthTodos);
router.get('/get-parent-todo/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['todo']), TodoController.getParentTodo);

module.exports = router;


