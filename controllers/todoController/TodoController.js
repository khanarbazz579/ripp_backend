process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const moment = require('moment');
const Category = require('./../../models').categories;
const Todo = require('./../../models').todos;
const TodoContact = require('./../../models').todo_contacts;
const commonFunction = require('../../services/commonFunction');
const Sequelize = require('sequelize');
const repeatHelper = require('../../helpers/repeatHelper');
const deletedEvents = require('./../../models').deleted_events;
const EventRepeaters = require('./../../models').event_repeats;
const Contacts = require('./../../models').contacts;
const Company = require('./../../models').companies;
const LeadClient = require('./../../models').leads_clients;
const WEEKS = ['first', 'second', 'third', 'forth', 'fifth', 'last'];
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const Notification = require('./../../models').notifications;
/* to create a new todo */
const create = async function(req, res) {
    let err, todo = {};
    if (!req.body.name) {
        return ReE(res, { message: 'Todo name cannot be empty' }, 422);
    }
    // req.body.startTime = moment.utc(req.body.startTime).format();
    // req.body.endTime = moment.utc(req.body.endTime).format();
    // todo.start = moment(moment(req.body.startTime).format("YYYY-MM-DD")).hour(moment(req.body.startTime).hour()).minute(moment(req.body.startTime).minute());
    // todo.end = req.body.endTime ? moment.utc(req.body.endTime).format() : '';
    todo.start = req.body.startTime;
    todo.end = req.body.endTime;
    todo.name = req.body.name;
    todo.category_id = req.body.categoryId;
    todo.is_all_day = req.body.is_all_day;
    todo.notes = req.body.notes;
    todo.is_priority = req.body.priority;
    todo.remind_me = req.body.reminder;
    todo.user_id = req.user.id;
    let todo_info = Object.assign({
        ...todo
    });
    /* add case */
    [err, createTodo] = await to(Todo.create(todo_info));
    if (err) {
        return ReE(res, err, 422);
    }


    if (createTodo.remind_me && createTodo.remind_me != "" && createTodo.remind_me != undefined) {
        createTodo['reminder'] = createTodo.remind_me;
        let [err, notification] = await commonFunction.insertNotification(createTodo, "TODO");
        if (err) {
            return ReE(res, err, 422);
        }
    }

    let todo_json = createTodo.toJSON();

    if (req.body.selectedContacts && req.body.selectedContacts.length > 0) {
        await saveTodoContacts(req.body.selectedContacts, todo_json.id, true);
    }
    await saveEventRepeatInTodo(req.body, todo_json.id);
    return ReS(res, {
        todo: todo_json,
        message: "Todo created successfully"
    }, 201);
};




/* to edit a todo */
const edit = async function(req, res) {
    let err, todo = {};
    let updateData = {};
    let todoInfo = req.body;
    let todoUser = req.user;
    if (!req.body.name) {
        return ReE(res, { message: 'Todo name cannot be empty' }, 422);
    }
    if (!todoInfo.no_need_to_change_start_date) {
        todo.start = req.body.startTime;
    } else {
        let [ndateErr, ndateData] = await to(
            Todo.findByPk(req.body.todo_id)
        );
        todo.start = new Date(moment(ndateData.start).format('YYYY-MM-DD') + ' ' + moment(req.body.startTime).format('HH:mm:ss'));
    }

    todo.end = req.body.endTime;
    todo.name = req.body.name;
    todo.category_id = req.body.categoryId;
    todo.is_all_day = req.body.is_all_day;
    todo.notes = req.body.notes;
    todo.is_priority = req.body.priority;
    todo.remind_me = req.body.reminder;
    todo.user_id = req.user.id;
    let todo_info = Object.assign({
        ...todo
    });

    if (req.body.todo_id && req.body.todo_id != '' && req.body.parent == 0) { /* main todo */
        let existingTodo;
        [err, existingTodo] = await to(
            Todo.findByPk(req.body.todo_id)
        );

        if (err) {
            return ReE(res, err, 422);
        }
        if (existingTodo.remind_me != todo_info.remind_me) {
            existingTodo["reminder"] = todo_info.remind_me;
            let [err, notification] = await commonFunction.updateNotification(existingTodo, "TODO");
            if (err) {
                return ReE(res, err, 422);
            }
        }

        [err, updateTodo] = await to(
            existingTodo.update(todo)
        );

        if (err) {
            return ReE(res, err, 422);
        }
        // [err, updateTodo] = await to(Todo.update(todo, {
        //     where: {id: req.body.todo_id}
        // }));

        let uerr, utodo;
        [uerr, utodo] = await to(
            TodoContact.destroy({
                where: {
                    todo_id: req.body.todo_id
                }
            })
        );
        if (req.body.selectedContacts && req.body.selectedContacts.length > 0) {
            await saveTodoContacts(req.body.selectedContacts, req.body.todo_id, true);
        }

        await saveEventRepeatInTodo(req.body, req.body.todo_id);

        return ReS(res, {
            message: "Todo updated successfully"
        }, 201);

    } else if (req.body.todo_id && req.body.todo_id != '' && req.body.parent != 0 && req.body.selectedUpdateAll == true) { /* child todo update all */
        let existingTodo;
        let updateAllTodo = {};
        updateAllTodo.category_id = todoInfo.categoryId;
        updateAllTodo.is_all_day = todoInfo.is_all_day;
        updateAllTodo.remind_me = todoInfo.reminder;
        updateAllTodo.name = todoInfo.name;
        updateAllTodo.notes = todoInfo.notes;
        updateAllTodo.user_id = todoUser.id;

        [err, existingTodo] = await to(
            Todo.findByPk(req.body.todo_id)
        );
        if (err) {
            return ReE(res, err, 422);
        }
        if (existingTodo.remind_me != todo_info.remind_me) {
            existingTodo["reminder"] = todo_info.remind_me;
            let [err, notification] = await commonFunction.updateNotification(existingTodo, "TODO");
            if (err) {
                return ReE(res, err, 422);
            }
        }

        [if_err, existingChildTodo] = await to(Todo.findOne({
            where: { id: todoInfo.todo_id }
        }));

        if (if_err) {
            return ReE(res, err, 422);
        }

        if (existingChildTodo) {
            // [err, data] = await to(Todo.update(todo, {
            //   where: {
            //     id: todoInfo.todo_id
            //   }
            // }));
            [err, data] = await to(Todo.update(updateAllTodo, {
                where: {
                    id: todoInfo.parent
                }
            }));

        } else if (todoInfo.base == 'repeated' || todoInfo.parent != 0) {
            [err, data] = await to(Todo.update(updateAllTodo, {
                where: {
                    parent: todoInfo.parent
                }
            }));
        }

        // [err, updateTodo] = await to(Todo.update(todo, {
        //   where: { id: req.body.todo_id }
        // }));

        let uerr, utodo;
        [uerr, utodo] = await to(
            TodoContact.destroy({
                where: {
                    todo_id: req.body.todo_id
                }
            })
        );
        if (req.body.selectedContacts && req.body.selectedContacts.length > 0) {
            await saveTodoContacts(req.body.selectedContacts, req.body.todo_id, true);
        }

        await saveEventRepeatInTodo(req.body, req.body.todo_id);

        return ReS(res, {
            message: "Todo updated successfully"
        }, 201);

    } else if (req.body.todo_id && req.body.todo_id != '' && req.body.parent != 0 && req.body.selectedUpdateChild == true) { /* child todo create new */

        let existingTodo, rs;
        [err, existingTodo] = await to(
            Todo.findByPk(todoInfo.todo_id)
        );
        if (err) {
            return ReE(res, err, 422);
        }

        [err, childList] = await to(Todo.findOne({
            where: { id: todoInfo.todo_id }
        }));

        if ((childList && childList.parent != 0 || childList && childList.base == 'repeated')) {
            todo.parent = 0;
            [err, data] = await to(Todo.update(todo, {
                where: {
                    id: todoInfo.todo_id
                }
            }));


        } else {

            createTodo = {};
            createTodo.startTime = todoInfo.startTime;
            createTodo.end = todoInfo.endTime;
            createTodo.name = todoInfo.name;
            createTodo.category_id = todoInfo.categoryId;
            createTodo.is_all_day = todoInfo.is_all_day;
            createTodo.notes = '';
            createTodo.is_priority = 0;
            createTodo.remind_me = todoInfo.reminder;
            createTodo.user_id = todoUser.id;
            createTodo.todo_id = null;
            createTodo.parent = todoInfo.parent;
            rs = await addNewTodo(createTodo);

            let newChildErrr, child;
            [newChildErrr, child] = await to(Todo.findOne({
                id: todoInfo.id
            }));

            if (child) {
                child = JSON.stringify(child);
                child = JSON.parse(child);
                let todo_child_info = Object.assign({
                    ...child
                });
                todo_child_info.parent = todo_child_info.id;
                todo_child_info.is_deleted = 1;
                todo_child_info.start = todoInfo.startTime;
                delete todo_child_info.id;
                delete todo_child_info.created_at;
                delete todo_child_info.updated_at;
                let [saveChildErr, sc] = await to(
                    Todo.create(todo_child_info)
                );
            }

        }
        // if (existingTodo.remind_me != todo_info.remind_me) {
        //     existingTodo["reminder"] = todo_info.remind_me;
        //     let [err, notification] = await commonFunction.updateNotification(existingTodo, "TODO");
        //     if (err) {
        //         return ReE(res, err, 422);
        //     }
        // }



        let uerr, utodo;
        [uerr, utodo] = await to(
            TodoContact.destroy({
                where: {
                    todo_id: rs.id
                }
            })
        );
        if (req.body.selectedContacts && req.body.selectedContacts.length > 0) {
            if (rs && rs.id) {
                await saveTodoContacts(req.body.selectedContacts, rs.id, true);
            }
            // else if(req.body.todo_id && req.body.parent != 0) {
            //   await saveTodoContacts(req.body.selectedContacts, req.body.todo_id, true);
            // }
        }

        if (rs && rs.id) {
            req.body.repeat.repeatVal = 'none';
            await saveEventRepeatInTodoData(req.body, rs.id);
        } else if (req.body.todo_id && req.body.parent != 0) {
            await saveEventRepeatInTodoData(req.body, req.body.todo_id);
        }

        return ReS(res, {
            message: "Todo updated successfully"
        }, 201);

    }



};
module.exports.edit = edit;



/* to save todo contact details */
const saveTodoContacts = async function(selectedContacts, todo_id, isSave) {
    var contacts = [];
    // Added condition at line 85 by Gourav S
    for (let i = 0; i < selectedContacts.length; i++) {
        contacts.push({
            contact_id: selectedContacts[i].contact_id ? selectedContacts[i].contact_id : selectedContacts[i].id,
            todo_id: todo_id
        });
    }

    let error, todoContact;
    [error, todoContact] = await to(TodoContact.bulkCreate(contacts, {
        returning: true
    }));
    if (error) {
        return console.log("Error", error);
    }
}


/* to save repeat details */
const saveEventRepeatInTodo = async function(data, todo_id) {
    /* repeat feature */
    [err, repeatData] = await to(EventRepeaters.findOne({
        where: { event_id: todo_id, repeat_for: 'todo' },
    }));
    [if_err, todoData] = await to(Todo.findOne({
        where: { id: todo_id },
    }));
    if (repeatData) { /* edit */
        await repeatHelper.saveEventRepeat(data.repeat, data.endrepeat, todo_id, 'todo', false);
    } else { /* insert */
        await repeatHelper.saveEventRepeat(data.repeat, data.endrepeat, todo_id, 'todo', true);
    }
}


/* to save todo repeat details */
const saveEventRepeatInTodoData = async function(data, todo_id) {
    /* repeat feature */
    [err, repeatData] = await to(EventRepeaters.findOne({
        where: { event_id: todo_id, repeat_for: 'todo' },
    }));
    [if_err, todoData] = await to(Todo.findOne({
        where: { id: todo_id },
    }));
    if (repeatData && todoData && todoData.parent != 0) { /* edit */
        await repeatHelper.saveEventRepeat(data.repeat, data.endrepeat, todo_id, 'todo', false);
    } else { /* insert */
        await repeatHelper.saveEventRepeat(data.repeat, data.endrepeat, todo_id, 'todo', true);
    }
}
module.exports.create = create;


/* to create a category */
const createCategory = async function(req, res) {
    let err, category;
    if (!req.body.name) {
        return ReE(res, { message: 'Category name cannot be empty' }, 422);
    }
    let category_info = Object.assign({
        ...req.body
    });
    [err, exists] = await to(Category.findOne({
        where: {
            name: req.body.name,
            user_id: req.user.id
        }
    }));
    if (exists) {
        return ReE(res, 'Category already exists.');
    } else { /* add case */
        category_info.user_id = req.user.id;
        [err, category] = await to(Category.create(category_info));
        console.log("Error:::" + JSON.stringify(err));
        if (err) {
            return ReE(res, err, 422);
        }
        let category_json = category.toJSON();
        return ReS(res, {
            category: category_json,
            message: "Category added successfully"
        }, 201);
    }
};
module.exports.createCategory = createCategory;



/* to edit a category */
const editCategory = async function(req, res) {
    let err, category;
    if (!req.body.name) {
        return ReE(res, { message: 'Category name cannot be empty' }, 422);
    }
    let category_info = Object.assign({
        ...req.body
    });
    [err, exists] = await to(Category.findOne({
        where: {
            name: req.body.name,
            user_id: req.user.id
        }
    }));
    if (exists) {
        return ReE(res, 'Category already exists.');
    } else {
        if (req.body.category_id && req.body.category_id != '') { /* editcase */
            [err, updateCat] = await to(Category.update(category_info, {
                where: { id: req.body.category_id }
            }));
            if (err) {
                return ReE(res, err, 422);
            }
            return ReS(res, {
                message: "Category updated successfully"
            }, 201);
        }
    }
};
module.exports.editCategory = editCategory;



/* to get categories */
const getCategories = async function(req, res) {
    let categories, err;
    const user_id = (req.roleAccess.isActive) ? req.roleAccess.users : [req.user.id];

    [err, categories] = await to(
        Category.findAll({
            where: {
                user_id: {
                    $in: user_id
                },
            },
            attributes: {
                include: [
                    [Todo.sequelize.fn("COUNT", Todo.sequelize.literal(`DISTINCT(todos.id),CASE WHEN todos.is_complete = 0 AND  todos.parent = 0 THEN 1 END`)), "todo_count"]
                ]
            },
            group: [Todo.sequelize.col('categories.id')],
            include: [{
                model: Todo,
                attributes: [],
            }],
            order: [
                ['name', 'ASC']
            ]
        })
    );

    if (err) {
        return ReE(res, err);
    }

    let todo;
    let limit = 100;
    let offset = 0;

    let fromDate = moment().subtract(1000 * 365, 'days').format('YYYY-MM-DD');
    let toDate = moment().add(1000 * 365, 'days').format('YYYY-MM-DD');
    let countedCategory = [];
    for (let i = 0; i < categories.length; i++) {
        [errr, todo] = await to(
            Todo.sequelize.query(`CALL get_repeat_by_category('${fromDate}','${toDate}',${limit},${offset * limit},${user_id},1,${categories[i].id})`)
        );
        if(errr){
            return ReE(res,errr);
        }
        let cat = JSON.parse(JSON.stringify(categories[i]));
        delete cat.todo_count;
        if (todo.length > 99) {
            cat.todo_count = '99+';
            console.log(cat);
        } else {
            cat.todo_count = todo.length;
        }
        countedCategory.push(cat);
    }
    return ReS(res, {
        categories: countedCategory
    });
}
module.exports.getCategories = getCategories;

const getTodayCount = async(userId) => {
    let todos;
    let fromDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
    let toDate = moment().add(1, 'days').format('YYYY-MM-DD');
    let limit = 500;
    let offset = 0;
    let total = 0;
    [err, todos] = await to(
        Todo.sequelize.query(`CALL get_repeated_todos('${fromDate}','${toDate}',${limit},${offset * limit},${userId},1)`)
    );
    if (todos && todos.length > 0) {
        for (let i = 0; i < todos.length; i++) {
            let object = Object.assign(todos[i], {});
            let [merr, isMainStart] = await to(
                Todo.findByPk(object.id)
            );

            isMainStart = JSON.parse(JSON.stringify(isMainStart));
            if (moment(object.start).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') && moment().isSameOrAfter(moment(isMainStart.start), 'day'))
                total++;
        }
        return total;
    } else {
        return total;
    }
}

const getOverdueCount = async(userId) => {
    let todos;
    let fromDate = moment().subtract(1000 * 365, 'days').format('YYYY-MM-DD');
    let toDate = moment().subtract(0, 'days').format('YYYY-MM-DD');
    let limit = 500;
    let offset = 0;
    let total = 0;
    [err, todos] = await to(
        Todo.sequelize.query(`CALL get_repeated_todos('${fromDate}','${toDate}',${limit},${offset * limit},${userId},1)`)
    );
    if (todos && todos.length > 99) {
        total = "99+";
    }
    if (todos && todos.length > 0 && total != '99+') {
        for (let i = 0; i < todos.length; i++) {
            if (moment(todos[i].start).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD'))
                total++;
        }

        return total;
    } else {
        return total;
    }
}

/* to get todo count based on date */
const getTodoCount = async function(req, res) {
    let overdueTodos, completeTodos, futureTodos, todayTodos, repeatingTodos, futureFilterTodos, repeatTotal = 0;
    let whereConditions = {};
    let overdueCriteria = req.body.overdueDate;
    let todayCriteria = req.body.todayDate;
    let futureCriteria = req.body.futureDate;
    let fromDate, toDate;
    if (req.body && req.body.query) {
        fromDate = req.body.query.selectedDate.fromDate;
        toDate = req.body.query.selectedDate.toDate;
    }

    const user_id = (req.roleAccess.isActive) ? req.roleAccess.users : [req.user.id];

    [err, overdueTodos] = await to(
        Todo.count({
            where: {
                user_id: {
                    $in: user_id
                },
                start: overdueCriteria,
                is_complete: 0,
                parent: 0,
            }
        })
    );
    if (err) {
        return ReE(res, err);
    }

    if (err) {
        return ReE(res, err);
    }
    if (req.body.query.selectedDate && req.body.query.selectedDate.fromDate) {

        [err, futureFilterTodos] = await to(
            Todo.count({
                where: {
                    user_id: {
                        $in: user_id
                    },
                    start: {
                        $between: [fromDate, toDate],
                    },
                    is_complete: 0,
                    parent: 0,
                    is_deleted: 0
                }
            })
        );
        if (err) {
            return ReE(res, err);
        }
    }

    let fromDatePass = moment().subtract(2, 'days').format('YYYY-MM-DD');
    let toDatePass = moment().add(8, 'days').format('YYYY-MM-DD');
    if (fromDate) {
        fromDatePass = moment(fromDate).subtract(1, 'days').format('YYYY-MM-DD');
        toDatePass = moment(toDate).add(1, 'days').format('YYYY-MM-DD');
    }
    let futurCount = 0;

    [err, futureTodos] = await to(
        Category.sequelize.query(`CALL get_repeated_todos('${fromDatePass}','${toDatePass}',${500},${0},${user_id.toString()},1)`)
    );
    if (futureTodos && futureTodos.length > 99) {
        futurCount = '99+';
    }
    if (futureTodos && futureTodos.length > 0 && futurCount != '99+') {
        for (let i = 0; i < futureTodos.length; i++) {

            if (moment(futureTodos[i].start).format('YYYY-MM-DD') < moment(toDatePass).format('YYYY-MM-DD') && moment(futureTodos[i].start).format('YYYY-MM-DD') > moment().format('YYYY-MM-DD'))
                futurCount++;
        }

    }

    futureTodos = {
        total: futurCount
    }




    if (err) {
        return ReE(res, err);
    }
    [err, completeTodos] = await to(
        Todo.count({
            where: {
                user_id: {
                    $in: user_id
                },
                is_complete: 1,
                is_deleted: 0,
            }
        })
    );
    if (err) {
        return ReE(res, err);
    }

    [err, repeatingTodos] = await to(
        Todo.count({
            // where: whereConditions,        
            //         include:[
            //          {
            //             model: EventRepeaters,
            //             as: 'event_repeats',
            //             where: { repeat_type : {'$ne':'none'},repeat_for:'todo', repeat_for : {'$ne':'event'}},
            //         }
            //         ],
            //         order: [
            //             ['is_priority', 'DESC'],
            //             ['start', 'ASC']
            //         ],
            //         where : {parent: 0},   
            where: whereConditions,
            include: [{
                model: EventRepeaters,
                as: 'event_repeats',
                where: { repeat_type: { '$ne': 'none' }, repeat_for: 'todo', repeat_for: { '$ne': 'event' } },
            }],
            order: [
                ['is_priority', 'DESC'],
                ['start', 'ASC']
            ],
            where: {
                parent: 0
            },
            group: ['name'],
        })
    );
    if (err) {
        return ReE(res, err);
    }
    if (repeatingTodos) {
        repeatTotal = repeatingTodos.length;
    }
    let total_count = {
        overdue: await getOverdueCount(req.user.id),
        today: await getTodayCount(req.user.id),
        future: futureTodos.total,
        completed: completeTodos,
        repeating: repeatTotal,
        futureFilterTodos: futureFilterTodos
    };

    return ReS(res, { todo_count: total_count });
}
module.exports.getTodoCount = getTodoCount;



/* to get todos */
const getTodos = async function(req, res) {
    let err, todo;
    let totalLength;
    let EndDate;
    let startCalDate;

    const user_id = (req.roleAccess.isActive) ? req.roleAccess.users : [req.user.id];

    if ((req.params.type == "today" || req.params.type == "future" || req.params.type == "overdue" || req.params.type == "completed" || req.params.type == "repeating")) {
        let type = req.params.type;
        let criterionDate = req.body.criterionDate;
        let todayDate = commonFunction.todayDate(new Date());
        let lastTodo;
        let firstTodo;
        let lastRepDate;
        let totalRepTodos;
        let firstRepDate;
        let todoCounter = req.body.query.count;
        totalLength = req.body.query.length;
        if (req.body.query.lastNonRepTodo !== undefined && req.body.query.lastNonRepTodo !== '') {
            lastTodo = req.body.query.lastNonRepTodo.startTime;
        }
        if (req.body.query.firstNonRepTodo !== undefined && req.body.query.firstNonRepTodo !== '') {
            firstTodo = req.body.query.firstNonRepTodo.startTime;
        }
        if (req.body.query.firstRepTodo !== undefined && req.body.query.firstRepTodo !== '') {
            firstRepDate = req.body.query.firstRepTodo;
        }
        if (req.body.query.lastRepTodo !== undefined && req.body.query.lastRepTodo !== '') {
            lastRepDate = req.body.query.lastRepTodo;
        }
        if (req.body.query.repTodos !== undefined && req.body.query.repTodos !== '' && req.body.query.repTodos.length > 0) {
            totalRepTodos = req.body.query.repTodos;
        }

        let whereConditions = {};
        if (type == "today") {
            // let todayStartDate = todayDate + " 00:00:00";
            // let todayEndDate = todayDate + " 23:59:59";
            // criterionDate = {
            //     $between: [todayStartDate, todayEndDate]
            // }
            // whereConditions = {
            //     user_id: {
            //       $in:user_id
            //     },
            //     start: criterionDate,
            //     is_complete: 0
            // }
            let todos;
            let fromDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
            let toDate = moment().add(1, 'days').format('YYYY-MM-DD');
            let limit = 500;
            let offset = 0;
            let todoFullData = [];
            [err, todos] = await to(
                Todo.sequelize.query(`CALL get_repeated_todos('${fromDate}','${toDate}',${limit},${offset * limit},${req.user.id},1)`)
            );
            if (todos && todos.length > 0) {

                for (let i = 0; i < todos.length; i++) {
                    let object = Object.assign(todos[i], {
                        contacts: await getTodoContactList(todos[i].id),
                        repeat: await repeatHelper.getRepeatDetails(todos[i].id, 'todo'),
                        endrepeat: await repeatHelper.getEndRepeatDetails(todos[i].id, 'todo'),
                    });

                    let [merr, isMainStart] = await to(
                        Todo.findByPk(object.id)
                    );

                    isMainStart = JSON.parse(JSON.stringify(isMainStart));

                    if (moment(object.start).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') && moment().isSameOrAfter(moment(isMainStart.start), 'day'))
                        todoFullData.push(object);
                }
            }
            return ReS(res, { todo: todoFullData });

        } else if (type == "future") {
            if (req.body.query.sort && req.body.query.sort.fromDate) {
                startCalDate = req.body.query.sort.fromDate;
                EndDate = req.body.query.sort.toDate;
                criterionDate = {
                    $between: [startCalDate, EndDate]
                }
            }
            // if (req.body.query.lastTodos !== undefined && req.body.query.lastTodos.lastNonRepTodo) {
            //     criterionDate = {
            //         $gt: req.body.query.lastTodos.lastNonRepTodo.startTime
            //     }
            // }

            whereConditions = {
                user_id: {
                    $in: user_id
                },
                start: criterionDate,
                // is_complete: 0,
                // parent: 0
            }
        } else if (type == "overdue") {
            let err, todos;
            let limit = req.body.query.length;
            let offset = req.body.query.offset || 0;
            let sort = req.body.query.sort;
            let fromDate = moment().subtract(1000 * 365, 'days').format('YYYY-MM-DD');
            let toDate = moment().format('YYYY-MM-DD');
            if (sort) {
                // fromDate = moment(sort.fromDate).subtract(2, 'days').format('YYYY-MM-DD');
                // toDate = moment(sort.toDate).subtract(1, 'days').format('YYYY-MM-DD');
            }
            [err, todos] = await to(
                Todo.sequelize.query(`CALL get_repeated_todos('${fromDate}','${toDate}',${limit},${offset * limit},${req.user.id},0)`)
            );
            if (todos && todos.length > 0) {
                let todoFullData = [];
                for (let i = 0; i < todos.length; i++) {
                    let object = Object.assign(todos[i], {
                        contacts: await getTodoContactList(todos[i].id),
                        repeat: await repeatHelper.getRepeatDetails(todos[i].id, 'todo'),
                        endrepeat: await repeatHelper.getEndRepeatDetails(todos[i].id, 'todo'),
                    });
                    let [merr, isMainStart] = await to(
                        Todo.findByPk(object.id)
                    );

                    isMainStart = JSON.parse(JSON.stringify(isMainStart));
                    if (moment(object.start).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD') && moment(object.start).format('YYYY-MM-DD') >= moment(isMainStart.start).format('YYYY-MM-DD'))
                        todoFullData.push(object);
                }
                return ReS(res, { todo: todoFullData });
            }
        } else if (type == "repeating") {
            whereConditions = {
                user_id: {
                    $in: user_id
                },
                is_complete: 0,
                is_deleted: 0
                    // $and: [
                    //    Sequelize.literal('exists (select 1 from todos where is_complete = 0 GROUP)')
                    // ]
            }


        }
        if (type == "completed") {
            [err, todo] = await to(
                Todo.findAll({
                    where: {
                        user_id: {
                            $in: user_id
                        },
                        is_complete: 1,
                        is_deleted: 0,
                    },
                    include: [{
                        attributes: ['id'],
                        model: TodoContact,
                        as: "contacts",
                        include: [{
                            attributes: ["first_name", "last_name", "email"],
                            model: Contacts,
                            as: "contacts",
                            include: [{
                                model: LeadClient,
                                as: 'lead_client',
                                attributes: ['id'],
                                include: [{
                                    model: Company,
                                    as: 'companies',
                                    attributes: ["name"]
                                }],
                                required: false
                            }],
                        }]
                    }],
                    order: [
                        ['is_priority', 'DESC'],
                        ['completed_date', 'DESC']
                    ],
                    limit: req.body.query.length,
                    offset: req.body.query.start,
                })
            );
        } else if (type == "repeating") {
            delete whereConditions.is_complete;
            [err, todo] = await to(
                Todo.findAll({
                    where: whereConditions,
                    include: [{
                            attributes: ['id'],
                            model: TodoContact,
                            as: "contacts",
                            include: [{
                                attributes: ["first_name", "last_name", "email", "id"],
                                model: Contacts,
                                as: "contacts",
                                include: [{
                                    model: LeadClient,
                                    as: 'lead_client',
                                    attributes: ['id'],
                                    include: [{
                                        model: Company,
                                        as: 'companies',
                                        attributes: ["name"]
                                    }],
                                    required: false
                                }],
                            }]
                        },
                        {
                            model: EventRepeaters,
                            as: 'event_repeats',
                            where: { repeat_type: { '$ne': 'none' }, repeat_for: 'todo', repeat_for: { '$ne': 'event' } },
                        }
                    ],
                    order: [
                        ['is_priority', 'DESC'],
                        ['start', 'ASC']
                    ],
                    where: { parent: 0 },
                    // group: ['name'],
                    limit: req.body.query.length,
                    offset: req.body.query.start
                })
            );
        } else if (type == 'future') {
            let err, todos;
            let limit = req.body.query.length;
            let offset = req.body.query.offset || 0;
            let sort = req.body.query.sort;
            let fromDate = moment().format('YYYY-MM-DD');
            let toDate = moment().add(8, 'days').format('YYYY-MM-DD');
            if (sort) {
                fromDate = moment(sort.fromDate).subtract(1, 'days').format('YYYY-MM-DD');
                toDate = moment(sort.toDate).add(1, 'days').format('YYYY-MM-DD');
            }
            console.log("==================>", `CALL get_repeated_todos('${fromDate}','${toDate}',${limit},${offset * limit},${req.user.id},0)`);
            [err, todos] = await to(
                Todo.sequelize.query(`CALL get_repeated_todos('${fromDate}','${toDate}',${limit},${offset * limit},${req.user.id},0)`)
            );
            if (todos && todos.length > 0) {
                let todoFullData = [];
                for (let i = 0; i < todos.length; i++) {
                    let object = Object.assign(todos[i], {
                        contacts: await getTodoContactList(todos[i].id),
                        repeat: await repeatHelper.getRepeatDetails(todos[i].id, 'todo'),
                        endrepeat: await repeatHelper.getEndRepeatDetails(todos[i].id, 'todo'),
                    });
                    let [merr, isMainStart] = await to(
                        Todo.findByPk(object.id)
                    );

                    isMainStart = JSON.parse(JSON.stringify(isMainStart));
                    if (moment(object.start).format('YYYY-MM-DD') < moment(toDate).format('YYYY-MM-DD') && moment(object.start).format('YYYY-MM-DD') >= moment(isMainStart.start).format('YYYY-MM-DD'))
                        todoFullData.push(object);
                }
                return ReS(res, { todo: todoFullData });
            }
        }


        if (todo && todo.length > 0) {
            if (err) {
                return ReE(res, err);
            }
            let todoList = await setTodoList(todo);
            return ReS(res, { todo: todoList });
        } else {
            return ReE(res, { success: false, message: 'No todo found' });
        }

    } else {
        return ReE(res, { success: false, message: 'It should have requested type.' }, 422);
    }

}
module.exports.getTodos = getTodos;



/* get get alist a ist of contact recipents based on a todo id */
const getTodoContactList = async function(data) {
    let err;
    if (typeof data == 'number') {
        [err, data] = await to(TodoContact.findAll({
            where: {
                todo_id: data,
            },
            include: [{
                attributes: ["first_name", "last_name", "email", "id"],
                model: Contacts,
                as: "contacts",
                include: [{
                    model: LeadClient,
                    as: 'lead_client',
                    attributes: ['id'],
                    include: [{
                        model: Company,
                        as: 'companies',
                        attributes: ["name"]
                    }],
                    required: false
                }],
            }]
        }));
    }



    let contactList = [];
    if (data) {
        for (let i = 0; i < data.length; i++) {
            contactList.push({
                tc_id: data[i].id,
                first_name: data[i].contacts ? data[i].contacts.first_name : '',
                last_name: data[i].contacts ? data[i].contacts.last_name : '',
                email: data[i].contacts ? data[i].contacts.email : '',
                company_name: (data[i].contacts && data[i].contacts.lead_client && data[i].contacts.lead_client.companies) ? data[i].contacts.lead_client.companies.name : '',
                contact_id: data[i].contacts ? data[i].contacts.id : '',
            });
        }
    }
    return contactList;
}

/* to update the todo values (update_type = 'date') */
const updateDate = async function(req, res) {
    let todoInfo = req.body;
    let updateData = {};
    if (isNaN(parseInt(todoInfo.id))) {
        return ReE(res, { success: false, message: 'It should have requested todo id.' }, 422);
    }
    if (todoInfo.update_type == 'date') {
        // req.body.startTime = moment.utc(req.body.startTime).format();
        // req.body.endTime = moment.utc(req.body.endTime).format();
        // updateData.start = moment(moment(req.body.startTime).format("YYYY-MM-DD")).hour(moment(req.body.startTime).hour()).minute(moment(req.body.startTime).minute());
        // updateData.end = req.body.endTime ? moment.utc(req.body.endTime).format() : '';
        updateData.start = req.body.startTime;
        updateData.end = req.body.endTime;
        updateData.is_all_day = req.body.is_all_day;
        /* repeat feature */
        [err, repeatData] = await to(EventRepeaters.findOne({
            where: { event_id: todoInfo.id, repeat_for: 'todo' }
        }));

        if (repeatData) { /* edit */
            await repeatHelper.saveEventRepeat(req.body.repeat, req.body.endrepeat, todoInfo.id, 'todo', false);
        } else { /* insert */
            await repeatHelper.saveEventRepeat(req.body.repeat, req.body.endrepeat, todoInfo.id, 'todo', true);
        }
    }
    [err, data] = await to(Todo.update(updateData, {
        where: {
            id: todoInfo.id
        }
    }));
    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, { message: "Todo Updated Successfully" }, 200);
};
module.exports.updateDate = updateDate;



/* to update the todo values (update_type = 'priority') */
const updatePriority = async function(req, res) {
    let todoInfo = req.body;
    let updateData = {};
    if (isNaN(parseInt(todoInfo.id))) {
        return ReE(res, { success: false, message: 'It should have requested todo id.' }, 422);
    }
    if (todoInfo.update_type == 'priority') {
        updateData.is_priority = todoInfo.is_priority;

        if (todoInfo.is_priority == 1) {
            if (todoInfo.base == 'repeated') {
                todoInfo.id == null
                let rs = await addNewTodo(todoInfo);
                [err, data] = await to(Todo.update(updateData, {
                    where: {
                        id: rs.id
                    }
                }));
                if (err) {
                    return ReE(res, err, 422);
                }

                return ReS(res, { message: "Todo Updated Successfully" }, 200);
            } else if (todoInfo.id != null) {
                [err, data] = await to(Todo.update(updateData, {
                    where: {
                        id: todoInfo.id
                    }
                }));
                if (err) {
                    return ReE(res, err, 422);
                }

                return ReS(res, { message: "Todo Updated Successfully" }, 200);
            }

        } else {
            updateData.is_priority = 0;
            if (updateData && todoInfo.base == 'repeated') {
                [err, dataP] = await to(Todo.destroy({
                    where: {
                        id: todoInfo.id
                    }
                }));
                if (err) {
                    return ReE(res, err, 422);
                }

                return ReS(res, { message: "Todo Updated Successfully" }, 200);
            } else {
                [err, data] = await to(Todo.update(updateData, {
                    where: {
                        id: todoInfo.id
                    }
                }));
                if (err) {
                    return ReE(res, err, 422);
                }

                return ReS(res, { message: "Todo Updated Successfully" }, 200);
            }
        }
    }
};
module.exports.updatePriority = updatePriority;


/* to update the todo values (update_type = 'complete')*/
const updateComplete = async function(req, res) {
    let todoInfo = req.body;
    let updateData = {};
    if (isNaN(parseInt(todoInfo.id))) {
        return ReE(res, { success: false, message: 'It should have requested todo id.' }, 422);
    }
    if (todoInfo.update_type == 'complete') {
        if (todoInfo.is_complete == 1) {
            if (todoInfo.parent == 0 || todoInfo.base == 'main') {
                updateData.completed_date = moment().format("YYYY-MM-DD h:mm:ss");
                updateData.is_complete = 1;
            } else {
                [if_err, childList] = await to(Todo.findOne({
                    where: { id: todoInfo.id }
                }));
                if (childList && todoInfo.id != todoInfo.parent) {
                    updateData.completed_date = moment().format("YYYY-MM-DD h:mm:ss");
                    updateData.is_complete = 1;
                } else if (todoInfo.base == 'repeated' || todoInfo.parent != 0) {
                    todoInfo.id = null;
                    todoInfo.repeat.repeatVal = "none";
                    let rs = await addNewTodo(todoInfo);
                }
            }
        } else {
            updateData.is_complete = 0;

            [if_err, parentList] = await to(Todo.findOne({
                where: { id: todoInfo.parent }
            }));
            if (parentList && todoInfo.is_priority == false) {
                [err, dataP] = await to(Todo.destroy({
                    where: {
                        id: todoInfo.id
                    }
                }));
            } else if (parentList && todoInfo.is_priority == true) {
                updateData.is_complete = 0;
            } else {
                updateData.is_complete = 0;
                updateData.parent = 0;
            }
        }
    }

    [err, data] = await to(Todo.update(updateData, {
        where: {
            id: todoInfo.id
        }
    }));
    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, { message: "Todo Updated Successfully" }, 200);
};
module.exports.updateComplete = updateComplete;




/* update the todo on marked as complete if has repeat */
const updateTodoRepeats = async function(todo) {
    if (todo.repeat && todo.repeat.repeatVal == 'every_day') {
        todo.start = moment(moment.utc(todo.start).add(1, 'days'));
        todo.end = moment(moment.utc(todo.end).add(1, 'days'));
        if (todo.endrepeat && todo.endrepeat.endrepeatVal != '' && todo.endrepeat.endrepeatVal != 'none') {
            await handleEndrepeat(todo);
        } else if (todo.base == 'repeated') {
            let rs = await addNewTodo(todo);
        }
    } else if (todo.repeat && todo.repeat.repeatVal == 'every_month') {
        todo.start = moment(moment.utc(todo.start).add(1, 'months'));
        todo.end = moment(moment.utc(todo.end).add(1, 'months'));
        if (todo.endrepeat && todo.endrepeat.endrepeatVal != '' && todo.endrepeat.endrepeatVal != 'none') {
            await handleEndrepeat(todo);
        } else {
            await addNewTodo(todo);
        }
    } else if (todo.repeat && todo.repeat.repeatVal == 'every_week') {
        todo.start = moment(moment.utc(todo.start).add(1, 'weeks'));
        todo.end = moment(moment.utc(todo.end).add(1, 'weeks'));
        if (todo.endrepeat && todo.endrepeat.endrepeatVal != '' && todo.endrepeat.endrepeatVal != 'none') {
            await handleEndrepeat(todo);
        } else if (todo.base == 'repeated') {
            await addNewTodo(todo);
        }
    } else if (todo.repeat && todo.repeat.repeatVal == 'every_year') {
        todo.start = moment(moment.utc(todo.start).add(1, 'years'));
        todo.end = moment(moment.utc(todo.end).add(1, 'years'));
        if (todo.endrepeat && todo.endrepeat.endrepeatVal != '' && todo.endrepeat.endrepeatVal != 'none') {
            await handleEndrepeat(todo);
        } else if (todo.base == 'repeated') {
            await addNewTodo(todo);
        }
    } else if (todo.repeat && todo.repeat.repeatVal == 'custom') {
        if (todo.repeat.repeatDetails.repeatDetailsValue == "daily") {
            todo.start = moment(moment.utc(todo.start).add(todo.repeat.repeatDetails.repeatInnerDetails.daily.every, 'days'));
            todo.end = moment(moment.utc(todo.end).add(todo.repeat.repeatDetails.repeatInnerDetails.daily.every, 'days'));
            if (todo.endrepeat && todo.endrepeat.endrepeatVal != '' && todo.endrepeat.endrepeatVal != 'none') {
                await handleEndrepeat(todo);
            } else if (todo.base == 'repeated') {
                await addNewTodo(todo);
            }
        } else if (todo.repeat.repeatDetails.repeatDetailsValue == "weekly") {

            let start = moment(moment.utc(todo.start).add(todo.repeat.repeatDetails.repeatInnerDetails.weekly.every, 'weeks'));
            let end = moment(moment.utc(todo.end).add(todo.repeat.repeatDetails.repeatInnerDetails.weekly.every, 'weeks'));
            let weekday = todo.repeat.repeatDetails.repeatInnerDetails.weekly.weekday;
            for (let i = 0; i < weekday.length; i++) {
                todo.start = moment(moment.utc(start).weekday(weekday[i]));
                todo.end = moment(moment.utc(end).weekday(weekday[i]));
                if (todo.endrepeat && todo.endrepeat.endrepeatVal != '' && todo.endrepeat.endrepeatVal != 'none') {
                    await handleEndrepeat(todo);
                } else if (todo.base == 'repeated') {
                    await addNewTodo(todo);
                }
                //await addNewTodo(todo);
            }
        } else if (todo.repeat.repeatDetails.repeatDetailsValue == "monthly") {

            if (todo.repeat.repeatDetails.repeatInnerDetails.monthly.type == "on") {
                // todo.start = moment(moment.utc(todo.start).add(1, 'months'));
                // var startOfMonth = moment(todo.start).utc().startOf('month').startOf('isoweek');
                // let weekNumber = WEEKS.indexOf(todo.repeat.repeatDetails.repeatInnerDetails.monthly.freq);
                // let dayNumber = DAYS.indexOf(todo.repeat.repeatDetails.repeatInnerDetails.monthly.day);
                // let studyDate; let lastWeekNum;
                // if(weekNumber == 6) { /* if last week */
                //     studyDate =  moment(todo.start).endOf('month').day(dayNumber);
                // } else {
                //     studyDate = moment(todo.start).utc().startOf('month').startOf('isoweek').add(weekNumber, 'w');
                //     if (studyDate.month() == startOfMonth.month()) {
                //         studyDate = studyDate.subtract(dayNumber, 'w');
                //     }
                // }

            } else {
                let monthday = todo.repeat.repeatDetails.repeatInnerDetails.monthly.monthday;
                if (monthday.length == 1 && monthday[0] == 0) {
                    monthday[0] = moment(todo.start).date();
                }
                let d = moment(moment.utc(todo.start).add(todo.repeat.repeatDetails.repeatInnerDetails.monthly.every, 'months'));
                let m = moment(d).format("M");
                let y = moment(d).format("Y");
                let startDate = moment([y, m - 1]);
                for (let i = 0; i < monthday.length; i++) {
                    todo.start = moment(moment.utc(startDate).add(monthday[i], 'days'));
                    todo.end = moment(moment.utc(startDate).add(monthday[i], 'days'));
                    if (todo.endrepeat && todo.endrepeat.endrepeatVal != '' && todo.endrepeat.endrepeatVal != 'none') {
                        await handleEndrepeat(todo);
                    } else if (todo.base == 'repeated') {
                        await addNewTodo(todo);
                    }
                }
            }

        } else if (todo.repeat.repeatDetails.repeatDetailsValue == "yearly") {

            if (todo.repeat.repeatDetails.repeatInnerDetails.yearly.type == "on") {

            } else {
                let yearsMonth = todo.repeat.repeatDetails.repeatInnerDetails.yearly.yearmonth;
                let d = moment(moment.utc(todo.start).add(todo.repeat.repeatDetails.repeatInnerDetails.yearly.every, 'years'));
                let day = parseInt(moment(d).format("DD"));
                let startDate = moment(d).startOf("year").add(day, "days");

                if (yearsMonth.length == 1 && yearsMonth[0] == 0) {
                    yearsMonth[0] = moment(todo.start).month();
                }

                for (let i = 0; i < yearsMonth.length; i++) {
                    todo.start = moment(moment.utc(startDate).add((yearsMonth[i] - 1), 'months'));
                    todo.end = moment(moment.utc(startDate).add((yearsMonth[i] - 1), 'months'));
                    if (todo.endrepeat && todo.endrepeat.endrepeatVal != '' && todo.endrepeat.endrepeatVal != 'none') {
                        await handleEndrepeat(todo);
                    } else if (todo.base == 'repeated') {
                        await addNewTodo(todo);
                    }
                }
            }
        }
    }

}

/* to manage conditions of end repeat */
const handleEndrepeat = async function(todo) {
    if (todo.endrepeat.endrepeatVal == 'on_date' && todo.endrepeat.endrepeatDetail) {
        if (moment(todo.start).format("YYYY-MM-DD") <= todo.endrepeat.endrepeatDetail) {
            let rs = await addNewTodo(todo);
        }
    } else if (todo.endrepeat.endrepeatVal == 'after') {
        [err, repeatData] = await to(EventRepeaters.findOne({
            where: { event_id: todo.id, repeat_for: 'todo', id: todo.repeat.repeatId }
        }));
        let old_status = parseInt(repeatData.end_repeat_status);
        if (parseInt(repeatData.end_repeat_status) <= parseInt(repeatData.end_repeat_on_hours) - 1) {
            let rs = await addNewTodo(todo);
            let new_status = old_status + 1;
            [newerr, newrepeatData] = await to(EventRepeaters.findOne({
                where: { event_id: rs.id, repeat_for: 'todo' }
            }));
            [rerr, rdata] = await to(EventRepeaters.update({ end_repeat_status: new_status }, {
                where: {
                    id: newrepeatData.id
                }
            }));
        }
    }
    return true;
}

/* to create a new todo when one is completed if the todo is repeating type */
const addNewTodo = async function(data) {
    let err, todo = {};
    todo.start = data.startTime;
    todo.end = data.end;
    todo.name = data.name;
    todo.category_id = data.category_id;
    todo.is_all_day = data.is_all_day ? 1 : 0;
    todo.notes = data.notes;
    todo.is_priority = data.is_priority;
    todo.remind_me = data.remind_me;
    todo.user_id = data.user_id;
    todo.id = null;

    if (data.base == "repeated") {
        if (data.update_type == "complete") {
            todo.is_complete = 1;
            todo.completed_date = moment.utc();
        } else if (data.update_type == "priority") {
            todo.is_priority = 1;
            // todo.id  = data.id;

        } else if (data.update_type == 'delete') {
            todo.is_deleted = 1;

        }
    }
    if (data.parent == 0) {
        todo.parent = data.id;
    } else {
        todo.parent = data.parent;
    }

    [add_err, parentData] = await to(Todo.findOne({
        where: { name: data.name, parent: data.parent, start: data.start }
    }));
    if (parentData == null) {
        let todo_info = Object.assign({
            ...todo
        });
        [err, createTodo] = await to(Todo.create(todo_info));
        if (err) {
            return false;
        }
        let todo_json = createTodo.toJSON();
        if (data.contacts && data.contacts.length > 0) {
            await saveTodoContacts(data.contacts, todo_json.id, true);
        }
        await saveEventRepeatInTodo(data, todo_json.id);
        return todo_json;
    } else {
        return {};
    }
};


/* update todo in bulk (Delete)*/
const bulkDelete = async function(req, res) {
    let err, data;
    let todoBody = req.body;
    let todoInfo = {};
    let updateData = {};
    if (todoBody.selectedTodosList.length > 0) {
        await asyncForEach(todoBody.selectedTodosList, async(value, index) => {
            if (todoBody.type == 'delete') {
                // value['is_deleted'] = true;
                if (value.parent == 0 || value.base == 'main') {
                    [err, data] = await to(Todo.destroy({
                        where: {
                            id: value.id
                        }
                    }));
                    [terr, tdata] = await to(TodoContact.destroy({
                        where: {
                            todo_id: value.id
                        }
                    }));

                    [rerr, rdata] = await to(EventRepeaters.destroy({
                        where: {
                            event_id: value.id,
                            repeat_for: 'todo'
                        }
                    }));

                    [err, data] = await to(
                        Notification.destroy({
                            where: {
                                $and: [{
                                        target_event_id: value.id
                                    },
                                    {
                                        type: "TODO"
                                    }
                                ]
                            }
                        })
                    );
                    [err, data] = await to(Todo.destroy({
                        where: {
                            parent: value.id,
                            is_complete: 0
                        }
                    }));
                }
                /*To delete child todos */
                else {

                    [if_err, childList] = await to(Todo.findOne({
                        where: { id: value.id }
                    }));
                    if ((childList && value.parent != 0 || childList && value.base == 'repeated') && value.is_deleted && value.id != value.parent) {
                        updateData.is_deleted = true;
                        [err, data] = await to(Todo.update(updateData, {
                            where: {
                                id: value.id
                            }
                        }));
                    } else {

                        if (value.id != value.parent && value.is_deleted == false) {
                            updateData.is_deleted = true;
                            [err, data] = await to(Todo.update(updateData, {
                                where: {
                                    id: value.id
                                }
                            }));
                            // [err, data] = await to(Todo.destroy({
                            //   where: {
                            //     id: value.id
                            //   }
                            // }));
                        } else if (value.base == 'repeated' || value.parent != 0) {
                            value.id = null;
                            value['update_type'] = 'delete';
                            let rs = await addNewTodo(value);
                        }
                    }
                }

            }
        });
    } else {
        return ReE(res, { message: 'Please select atleast one list!' }, 422);
    }
    return ReS(res, {
        message: 'Todo updated successfully.'
    }, 200);
};
module.exports.bulkDelete = bulkDelete;


/* update todo in bulk (change-category)*/
const bulkChangeCat = async function(req, res) {
    let err, data;
    let todoBody = req.body;
    let todoDateData = {};
    if (todoBody.selectedTodosList && todoBody.selectedTodosList.length > 0) {
        await asyncForEach(todoBody.selectedTodosList, async(todoInfo, index) => {
            if (todoBody.type == 'change-category') {
                todoInfo.category_id = todoBody.category_id;
                if (todoInfo.base == "repeated") {
                    let err, todo;
                    todo = {};
                    todo.start = todoInfo.startTime;
                    todo.end = todoInfo.end;
                    todo.name = todoInfo.name;
                    todo.category_id = todoInfo.category_id;
                    todo.is_all_day = todoInfo.is_all_day ? 1 : 0;
                    todo.notes = todoInfo.notes;
                    todo.is_priority = todoInfo.is_priority;
                    todo.remind_me = todoInfo.remind_me;
                    todo.user_id = todoInfo.user_id;
                    let [iErr, itodo] = await to(
                        Todo.create(todo)
                    );


                    if (todoInfo.contacts && todoInfo.contacts.length > 0) {
                        await saveTodoContacts(todoInfo.contacts, itodo.id, true);
                    }
                    todoInfo.repeat.repeatVal = "none";
                    await saveEventRepeatInTodo(todoInfo, itodo.id);
                    todo.parent = todoInfo.id;
                    todo.is_deleted = 1;
                    await to(Todo.create(todo));

                } else {
                    [err, data] = await to(Todo.update(todoInfo, {
                        where: {
                            id: todoInfo.id
                        }
                    }));
                }
            }
        });
    } else {
        return ReE(res, { message: 'Please select atleast one list!' }, 422);
    }
    return ReS(res, {
        message: 'Todo updated successfully.'
    }, 200);
};
module.exports.bulkChangeCat = bulkChangeCat;



/* update todo in bulk (change_due_date) */
const bulkChangeDueDate = async function(req, res) {
    let err, data;
    let todoBody = req.body;
    let todoInfo = {};
    let todoDateData = {};
    if (todoBody.ids.length > 0) {
        await asyncForEach(todoBody.ids, async(value, index) => {
            if (todoBody.type == 'change_due_date') {
                todoDateData.start = todoBody.dateData.startTime;
                todoDateData.end = todoBody.dateData.endTime;
                todoDateData.is_all_day = todoBody.dateData.is_all_day;
                [err, data] = await to(Todo.update(todoDateData, {
                    where: {
                        id: value
                    }
                }));
            }
        });
    } else {
        return ReE(res, { message: 'Please select atleast one list!' }, 422);
    }
    return ReS(res, {
        message: 'Todo updated successfully.'
    }, 200);
};
module.exports.bulkChangeDueDate = bulkChangeDueDate;



/* update todo in bulk (mark-completed) */
const bulkMarkCompleted = async function(req, res) {
    let err, data;
    let todoBody = req.body;
    let updateData = {};
    if (todoBody.selectedTodosList.length > 0) {
        await asyncForEach(todoBody.selectedTodosList, async(value, index) => {
            if (todoBody.type == 'mark-completed') {
                if (value.parent == 0 || value.base == 'main') {
                    updateData.completed_date = moment.utc();
                    updateData.is_complete = 1;
                } else {
                    [if_err, childList] = await to(Todo.findOne({
                        where: { id: value.id }
                    }));
                    if (childList && value.id != value.parent) {
                        updateData.completed_date = moment.utc();
                        updateData.is_complete = 1;
                    } else if (value.base == 'repeated' || value.parent != 0) {
                        value.id = null;
                        value['update_type'] = "complete";
                        if (value && value.repeat)
                            value.repeat.repeatVal = "none";
                        let rs = await addNewTodo(value);
                    }
                }
                [err, data] = await to(Todo.update(updateData, {
                    where: {
                        id: value.id
                    }
                }));

            }
        });
    } else {
        return ReE(res, { message: 'Please select atleast one list!' }, 422);
    }
    return ReS(res, {
        message: 'Todo updated successfully.'
    }, 200);
};
module.exports.bulkMarkCompleted = bulkMarkCompleted;



/* update todo in bulk (change_to_active) */
const bulkChangeToActive = async function(req, res) {
    let err, data;
    let todoBody = req.body;
    let updateData = {};
    if (todoBody.selectedTodosList.length > 0) {
        await asyncForEach(todoBody.selectedTodosList, async(value, index) => {
            if (todoBody.type == 'change_to_active') {
                updateData.is_complete = 0;
                [if_err, parentList] = await to(Todo.findOne({
                    where: { id: value.parent }
                }));
                if (parentList && value.is_priority == false) {
                    [err, dataP] = await to(Todo.destroy({
                        where: {
                            id: value.id
                        }
                    }));
                } else if (parentList && value.is_priority == true) {
                    updateData.is_complete = 0;
                } else {
                    updateData.is_complete = 0;
                    updateData.parent = 0;
                }
                [err, data] = await to(Todo.update(updateData, {
                    where: {
                        id: value.id
                    }
                }));
            }
        });
    } else {
        return ReE(res, { message: 'Please select atleast one list!' }, 422);
    }
    return ReS(res, {
        message: 'Todo updated successfully.'
    }, 200);
};
module.exports.bulkChangeToActive = bulkChangeToActive;



/* to get todos for particular category */
const getCategoryTodo = async function(req, res) {

    const user_id = (req.roleAccess.isActive) ? req.roleAccess.users : [req.user.id];
    if (!req.body.category_id) {
        return ReE(res, { message: 'Category id required' }, 422);
    }


    let err, todo;
    let limit = req.body.length;
    let offset = req.body.start || 0;

    let fromDate = moment().subtract(1000 * 365, 'days').format('YYYY-MM-DD');
    let toDate = moment().add(1000 * 365, 'days').format('YYYY-MM-DD');

    [err, todo] = await to(
        Todo.sequelize.query(`CALL get_repeat_by_category('${fromDate}','${toDate}',${limit},${offset},${user_id},0,${req.body.category_id})`)
    );

    if (todo && todo.length > 0) {
        if (err) {
            return ReE(res, err);
        }
        let todoList = await setTodoList(todo);
        return ReS(res, { todo: todoList });
    } else {
        return ReE(res, { success: false, message: 'No todo found' });
    }
}
module.exports.getCategoryTodo = getCategoryTodo;

/* to delete category */
const deleteCategory = async function(req, res) {
    if (req.body.category_id && req.body.category_id != '') {
        let cerr;
        [cerr, todo] = await to(
            Todo.findAll({
                where: {
                    user_id: req.user.id,
                    category_id: req.body.category_id,
                }
            })
        );
        if (todo && todo.length > 0) {
            if (req.body.selected_cat) {
                let todoInfo = {};
                await todo.forEach(async function(value, index) {
                    todoInfo.category_id = req.body.selected_cat;
                    [terr, data] = await to(Todo.update(todoInfo, {
                        where: {
                            id: value.id
                        }
                    }));
                });
            }
            let err, cat;
            [err, cat] = await to(
                Category.destroy({
                    where: {
                        id: req.body.category_id
                    }
                })
            );
            return ReS(res, {
                message: "Category deleted successfully"
            }, 201);
        } else {
            let err, cat;
            [err, cat] = await to(
                Category.destroy({
                    where: {
                        id: req.body.category_id
                    }
                })
            );
            return ReS(res, {
                message: "Category deleted successfully"
            }, 201);
        }
    } else {
        return ReE(res, { success: false, message: 'It should have requested category id.' }, 422);
    }
}
module.exports.deleteCategory = deleteCategory;

/* to get todos according to month */
const getMonthTodos = async function(req, res) {
    let err;
    const user_id = (req.roleAccess.isActive) ? req.roleAccess.users : [req.user.id];
    if (req.body.month && req.body.month != '') {
        let date1 = new Date(req.body.month);
        let month = date1.getMonth() + 1;
        let year = moment.utc(date1).format("YYYY");
        let type = req.body.type;
        let criterionDate;
        let todayDate = commonFunction.todayDate(new Date());

        if (type == "future") {
            let futureDate = todayDate + " 23:59:59";
            criterionDate = {
                $gt: futureDate
            }
        } else if (type == "overdue") {
            let overdueDate = todayDate + " 00:00:00";
            criterionDate = {
                $lt: overdueDate
            }
        }

        [err, todo] = await to(
            Todo.findAll({
                where: {
                    $and: [Todo.sequelize.literal(`MONTH(todos.start) = ` + month + ` AND YEAR(todos.start) = ` + year),
                        { user_id: { $in: user_id } }, { is_complete: 0 }, { start: criterionDate }
                    ]
                },
                include: [{
                    attributes: ['id'],
                    model: TodoContact,
                    as: "contacts",
                    include: [{
                        attributes: ["first_name", "last_name", "email", "id"],
                        model: Contacts,
                        as: "contacts",
                        include: [{
                            model: LeadClient,
                            as: 'lead_client',
                            attributes: ['id'],
                            include: [{
                                model: Company,
                                as: 'companies',
                                attributes: ["name"]
                            }],
                            required: false
                        }],
                    }]
                }],
                order: [
                    ['is_priority', 'DESC'],
                    ['start', 'DESC']
                ]
            })
        );

        if (todo && todo.length > 0) {
            if (err) {
                return ReE(res, err);
            }
            let todoList = await setTodoList(todo);
            return ReS(res, { todo: todoList });
        } else {
            return ReE(res, { success: false, message: 'No todo found' });
        }

    } else {
        return ReE(res, { success: false, message: 'It should have requested month.' }, 422);
    }

}
module.exports.getMonthTodos = getMonthTodos;

/* returns list of todos with processed data */
const setTodoList = async function(todo) {
    let todoList = [];
    let contactList = [];
    for (let i = 0; i < todo.length; i++) {
        let formatted_date_2 = '';
        if (todo[i].is_all_day == 1) {
            formatted_date_2 = moment.utc(todo[i].start).format("dddd DD MMMM YYYY") + ' All Day ';
        } else {
            formatted_date_2 = moment.utc(todo[i].start).format("dddd DD MMMM YYYY") + ' ' + moment.utc(todo[i].start).format("HH:mm") + '-' + moment.utc(todo[i].end).format("HH:mm");
        }
        todoList.push({
            id: todo[i].id,
            name: todo[i].name,
            formatted_date: todo[i].start,
            formatted_date_2: formatted_date_2,
            startTime: todo[i].start,
            endTime: todo[i].end,
            is_priority: todo[i].is_priority,
            is_complete: todo[i].is_complete,
            is_deleted: todo[i].is_deleted,
            start: todo[i].start,
            end: todo[i].end,
            is_all_day: todo[i].is_all_day,
            repeat: await repeatHelper.getRepeatDetails(todo[i].id, 'todo'),
            endrepeat: await repeatHelper.getEndRepeatDetails(todo[i].id, 'todo'),
            category_id: todo[i].category_id,
            notes: todo[i].notes,
            is_priority: todo[i].is_priority,
            contacts: await getTodoContactList(todo[i].id), //await getTodoContacts(todo[i].id),
            remind_me: todo[i].remind_me,
            user_id: todo[i].user_id,
            parent: todo[i].parent
        });
        if (todo[i].is_complete == 1) {
            todoList[i].completed_date = todo[i].completed_date;
        }
    };
    return todoList;
}


/* to get details of the parent todo */
const getParentTodo = async function(req, res) {
    let requestedId;
    if (req.body.parent != 0) {
        requestedId = req.body.parent;
    } else {
        requestedId = req.body.id;
    }

    [err, parentData] = await to(Todo.findOne({
        where: { id: requestedId },
        include: [{
            attributes: ['id'],
            model: TodoContact,
            as: "contacts",
            include: [{
                attributes: ["first_name", "last_name", "email", "id"],
                model: Contacts,
                as: "contacts",
                include: [{
                    model: LeadClient,
                    as: 'lead_client',
                    attributes: ['id'],
                    include: [{
                        model: Company,
                        as: 'companies',
                        attributes: ["name"]
                    }],
                    required: false
                }],
            }]
        }]
    }));

    if (err) {
        return ReE(res, err);
    }

    let todoData = {};
    let formatted_date_2 = '';

    if (parentData) {
        if (parentData.is_all_day == 1) {
            formatted_date_2 = moment.utc(parentData.start).format("dddd DD MMMM YYYY") + ' All Day ';
        } else {
            formatted_date_2 = moment.utc(parentData.start).format("dddd DD MMMM YYYY") + ' ' + moment.utc(parentData.start).format("HH:mm") + '-' + moment.utc(parentData.end).format("HH:mm");
        }
        todoData = {
            id: parentData.id,
            name: parentData.name,
            formatted_date: moment.utc(parentData.start).format("dddd DD MMMM YYYY"),
            formatted_date_2: formatted_date_2,
            startTime: parentData.start,
            endTime: parentData.end,
            is_priority: parentData.is_priority,
            is_complete: parentData.is_complete,
            start: parentData.start,
            end: parentData.end,
            is_all_day: parentData.is_all_day,
            repeat: await repeatHelper.getRepeatDetails(parentData.id, 'todo'),
            endrepeat: await repeatHelper.getEndRepeatDetails(parentData.id, 'todo'),
            category_id: parentData.category_id,
            notes: parentData.notes,
            is_priority: parentData.is_priority,
            contacts: await getTodoContactList(parentData.contacts), //await getTodoContacts(todo[i].id),
            remind_me: parentData.remind_me,
            user_id: parentData.user_id,
            parent: parentData.parent
        }
    } else {
        todoData = {};
    }
    return ReS(res, { todo: todoData });

}
module.exports.getParentTodo = getParentTodo;

module.exports.updateTodoRepeats = updateTodoRepeats;