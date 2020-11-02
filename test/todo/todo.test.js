const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');
const moment = require('moment');
const Folders = require('../../models').folders;
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');
const { updateTodoRepeats } = require("./../../controllers/todoController/TodoController");
const should = chai.should();
let user, token, loggedInUser, todosBody, todoId, updateTodoId;

chai.use(chaiHttp);

describe('todo', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });
    before((done) => {
        commonFunction.sequalizedDb(['user_details', 'call_outcomes_transitions', 'notes', 'histories', 'notifications', 'tasks', 'sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'leads_clients', 'suppliers', 'sales_stages', 'users', 'categories', 'event_repeats', 'todos', 'user_roles']).then(() => {
            userRoles = generatedSampleData.createdSampleData("user_roles", 1);
            commonFunction.addDataToTable("user_roles", userRoles[0]).then((data) => {
                roleBody = data
                permissionSet = generatedSampleData.createdSampleData("permission_sets", 1);
                commonFunction.addDataToTable("permission_sets", permissionSet[0]).then((data) => {
                    setBody = data;
                    user = generatedSampleData.createdSampleData("users", 1);
                    user[0].role_id = roleBody.id;
                    user[0].permission_set_id = setBody.id;
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        userBody = data;
                        sales_stages = generatedSampleData.createdSampleData("sales_stages", 1);
                        commonFunction.addDataToTable("sales_stages", sales_stages[0]).then((data) => {
                            salesStageBody = data;
                            leads = generatedSampleData.createdSampleData("leads_clients", 1);
                            leads[0].sales_stage_id = salesStageBody.id;
                            leads[0].user_id = userBody.id;
                            commonFunction.addDataToTable("leads_clients", leads[0]).then((data) => {
                                leadBody = data;
                                contacts = generatedSampleData.createdSampleData("contacts", 1);
                                contacts[0].entity_id = leadBody.id;
                                contacts[0].entity_type = "LEAD_CLIENT";
                                commonFunction.addDataToTable("contacts", contacts[0]).then((data) => {
                                    contactBody = data;
                                    todos = generatedSampleData.createdSampleData("todos", 1);
                                    todos[0].user_id = userBody.id;
                                    commonFunction.addDataToTable("todos", todos[0]).then((data) => {
                                        todosBody = data;
                                        done();
                                    });
                                    //done();
                                });
                            });
                        })
                    });
                });
            })
        });
    });

    it('it should be login user with token and credential', () => {
        return chai.request(server)
            .post('/api/users/login')
            .send(user[0])
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.token.should.be.a('string');
                token = res.body.token;
                loggedInUser = res.body.user;
                res.body.user.should.be.a('object');
                res.body.user.first_name.should.be.eql(user[0].first_name);
                res.body.user.last_name.should.be.eql(user[0].last_name);
                res.body.user.email.should.be.eql(user[0].email);
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    });

    it('it should not add category without token', () => {
        return chai.request(server)
            .post('/api/todo/add-category')
            .send({})
            .then((res) => {
                res.should.have.status(401);
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    });

    it('it should not edit category without token', () => {
        return chai.request(server)
            .post('/api/todo/edit-category')
            .send({})
            .then((res) => {
                res.should.have.status(401);
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    });


    it('check empty validation', () => {
        return chai.request(server)
            .post('/api/todo/add-category')
            .set({ Authorization: token })
            .send({})
            .then((res) => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Category name cannot be empty');
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    });

    describe('/POST Task', () => {
        before((done) => {
            category = generatedSampleData.createdSampleData("categories", 1);
            category.name = 'test';
            done();
        });
        it('it should POST with success message', () => {
            return chai.request(server)
                .post('/api/todo/add-category')
                .set({ Authorization: token })
                .send(category[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Category added successfully');
                    res.body.category.should.be.a('object');
                    res.body.category.name.should.be.eql(category[0].name);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            category = generatedSampleData.createdSampleData("categories", 1);
            category.name = 'test';
            done();
        });
        it('it should not have same category name', () => {
            return chai.request(server)
                .post('/api/todo/add-category')
                .set({ Authorization: token })
                .send(category[0])
                .then((res) => {
                    res.body.success.should.be.eql(false);
                    res.body.should.be.a('object');
                    res.body.message.should.be.a('string');
                    res.body.message.should.be.eql('Category already exists.');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });



    describe('/POST Task', () => {
        before((done) => {
            category = generatedSampleData.createdSampleData("categories", 1);
            category.name = 'test';
            done();
        });
        it('it should not have same category name', () => {
            return chai.request(server)
                .post('/api/todo/edit-category')
                .set({ Authorization: token })
                .send(category[0])
                .then((res) => {
                    res.body.success.should.be.eql(false);
                    res.body.should.be.a('object');
                    res.body.message.should.be.a('string');
                    res.body.message.should.be.eql('Category already exists.');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });



    describe('/POST Task', () => {
        before((done) => {
            category = generatedSampleData.createdSampleData("categories", 1);
            category[0].category_id = 1;
            category[0].name = 'category edit';
            done();
        });
        it('it should update category if category id is provided', () => {
            return chai.request(server)
                .post('/api/todo/edit-category')
                .set({ Authorization: token })
                .send(category[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Category updated successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        it('it should not GET ALL categories', () => {
            encodedObject = commonFunction.encodeToBase64(category[0]);
            return chai.request(server)
                .get('/api/todo/get-categories/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/POST Task', () => {
    //     it('it should not GET ALL categories', () => {
    //         encodedObject = commonFunction.encodeToBase64(category[0]);
    //         console.log("Category is ===========>",category[0]);
            
    //         return chai.request(server)
    //             .get('/api/todo/get-categories/'+encodedObject)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.should.be.a('object');
    //                 res.body.categories.should.be.a('array');
    //             }).catch(function(err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            todos[0].selectedContacts = [{ id: 1, firstname: 'shifali' }]
            done();
        });
        it('it should not POST a todo without access token', () => {
            return chai.request(server)
                .post('/api/todo/add-todo')
                .send(todos[0])
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should not edit a todo without access token', () => { /* edit case */
            return chai.request(server)
                .post('/api/todo/edit-todo')
                .send(todos[0])
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            todos[0].selectedContacts = [{ id: 1, firstname: 'shifali' }]
            todos[0].name = '';
            todos[0].repeat = {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        },
                        "repeatVal": "every_day"
                    }
                },
                todos[0].endrepeat = {
                    "endrepeatVal": "on_date",
                    "endrepeatDetail": 1
                }
            done();
        });

        it('it should not POST a todo without name', () => {
            return chai.request(server)
                .post('/api/todo/add-todo')
                .set({ Authorization: token })
                .send(todos[0])
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.a('string');
                    res.body.message.should.be.eql("Todo name cannot be empty");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should not POST a todo without name', () => { /* edit case */
            return chai.request(server)
                .post('/api/todo/edit-todo')
                .set({ Authorization: token })
                .send(todos[0])
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.a('string');
                    res.body.message.should.be.eql("Todo name cannot be empty");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            todos[0].selectedContacts = [{ id: 1, firstname: 'shifali' }]
            todos[0].repeat = {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        },
                        "repeatVal": "every_day"
                    }
                },
                todos[0].endrepeat = {
                    "endrepeatVal": "on_date",
                    "endrepeatDetail": 1
                }
            done();
        });
        it('it should POST with success message in add todo', () => {
            return chai.request(server)
                .post('/api/todo/add-todo')
                .set({ Authorization: token })
                .send(todos[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    updateTodoId = res.body.todo.id;
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Todo created successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/POST Task', () => {
    //     before((done) => {
    //         todos = generatedSampleData.createdSampleData("todos", 1);
    //         todos[0].selectedContacts = [{ id: 1, firstname: 'shifali' }];
    //         todos[0].todo_id = updateTodoId;
    //         todos[0].repeat = {
    //             "repeatVal": "none",
    //             "repeatDetails": {
    //                 "repeatDetailsValue": "daily",
    //                 "repeatInnerDetails": {
    //                     "daily": {
    //                         "every": 1,
    //                     },
    //                     "weekly": {
    //                         "every": 1,
    //                         "weekday": []
    //                     },
    //                     "monthly": {
    //                         "every": 1,
    //                         "monthday": [],
    //                         "type": "each",
    //                         "freq": "first",
    //                         "day": "day"
    //                     },
    //                     "yearly": {
    //                         "every": 1,
    //                         "yearmonth": [],
    //                         "type": "each",
    //                         "freq": "first",
    //                         "day": "day"
    //                     }
    //                 },
    //                 "repeatVal": "every_day"
    //             }
    //         },
    //             todos[0].endrepeat = {
    //                 "endrepeatVal": "on_date",
    //                 "endrepeatDetail": 1
    //             }
    //         done();
    //     });
    //     it('it should update if todo id is provided', () => {
    //         return chai.request(server)
    //             .post('/api/todo/edit-todo')
    //             .set({ Authorization: token })
    //             .send(todos[0])
    //             .then((res) => {
    //                 res.should.have.status(201);
    //                 res.body.should.be.a('object');
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Todo updated successfully');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });


    // describe('/POST Task', () => {
    //     before((done) => {
    //         todos = generatedSampleData.createdSampleData("todos", 1);
    //         todos[0].selectedContacts = [{ id: 1, firstname: 'shifali' }];
    //         todos[0].todo_id = updateTodoId;
    //         done();
    //     });
    //     it('it should update if todo id is provided and has repeat details', () => {
    //         return chai.request(server)
    //             .post('/api/todo/edit-todo')
    //             .set({ Authorization: token })
    //             .send(todos[0])
    //             .then((res) => {
    //                 res.should.have.status(201);
    //                 res.body.should.be.a('object');
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Todo updated successfully');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    describe('/POST todo Count', () => {
        encodedObject = commonFunction.encodeToBase64({});
        it('it should not post without access token', () => {
            return chai.request(server)
                .get('/api/todo/get-todo-count/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/POST todo Count without date filter', () => {
    //     it('it should get all todo count without date filter', () => {
    //         return chai.request(server)
    //             .post('/api/todo/get-todo-count')
    //             .set({ Authorization: token })
    //             .send({ "query": "" })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.should.be.a('object');
    //                 res.body.todo_count.should.be.a('object');
    //                 res.body.todo_count.should.have.property('overdue');
    //                 res.body.todo_count.should.have.property('today');
    //                 res.body.todo_count.should.have.property('future');
    //                 res.body.todo_count.should.have.property('completed');
    //                 res.body.todo_count.should.have.property('repeating');
    //                 res.body.todo_count.overdue.should.be.a('number');
    //                 res.body.todo_count.today.should.be.a('number');
    //                 res.body.todo_count.future.should.be.a('number');
    //                 res.body.todo_count.completed.should.be.a('number');
    //                 res.body.todo_count.repeating.should.be.a('number');
    //             }).catch(function(err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/POST todo Count with date filter', () => {
    //     it('it should get all todo count with date filter', () => {
    //         return chai.request(server)
    //             .post('/api/todo/get-todo-count')
    //             .set({ Authorization: token })
    //             .send({ "query": { "selectedDate": { "fromDate": faker.date.past(), "toDate": new Date() } } })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.should.be.a('object');
    //                 res.body.todo_count.should.be.a('object');
    //                 res.body.todo_count.should.have.property('overdue');
    //                 res.body.todo_count.should.have.property('today');
    //                 res.body.todo_count.should.have.property('future');
    //                 res.body.todo_count.should.have.property('completed');
    //                 res.body.todo_count.should.have.property('repeating');
    //                 res.body.todo_count.should.have.property('futureFilterTodos');
    //                 res.body.todo_count.overdue.should.be.a('number');
    //                 res.body.todo_count.today.should.be.a('number');
    //                 res.body.todo_count.future.should.be.a('number');
    //                 res.body.todo_count.completed.should.be.a('number');
    //                 res.body.todo_count.repeating.should.be.a('number');
    //                 res.body.todo_count.futureFilterTodos.should.be.a('number');

    //             }).catch(function(err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });



    describe('/GETALL Todos', () => {
        it('it should not GETALL todos without access token', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai.request(server)
                .get('/api/todo/get-todos/today/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GETALL Todos', () => {
        it('it should not return todos if param is not there', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai.request(server)
                .get('/api/todo/get-todos/abc/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.a('string');
                    res.body.message.should.be.eql("It should have requested type.");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GETALL Todos', () => {
        it('it should return all todays todos', () => {
            encodedObject = commonFunction.encodeToBase64({ "query": { "length": 5, "start": 0 } });
            return chai.request(server)
                .get('/api/todo/get-todos/today/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GETALL Todos', () => {
        /* Case: Future -> lastRepTodo !='' */
        it('it should return all next repeating future todos', () => {
            encodedObject = commonFunction.encodeToBase64({
                "query": {
                    "length": 25,
                    "start": 0,
                    "sort": { "fromDate": faker.date.past(), "toDate": new Date() },
                    "counter": 0,
                    "lastNonRepTodo": "",
                    "firstNonRepTodo": "",
                    "lastRepTodo": { "base": "repeated" },
                    "firstRepTodo": "",
                    "repTodos": []
                },
                "criterionDate": { "$gt": "2019-09-17T18:29:59.007Z" }
            });
            return chai.request(server)
                .get('/api/todo/get-todos/future/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        /* Case: Future -> firstRepTodo !='' */
        it('it should return all previous repeating future todos', () => {
            encodedObject = commonFunction.encodeToBase64({
                "query": {
                    "length": 25,
                    "start": 0,
                    "sort": { "fromDate": faker.date.past(), "toDate": new Date() },
                    "counter": 0,
                    "lastNonRepTodo": "",
                    "firstNonRepTodo": "",
                    "lastRepTodo": "",
                    "firstRepTodo": { "base": "repeated" },
                    "repTodos": []
                },
                "criterionDate": { "$gt": "2019-09-17T18:29:59.007Z" }
            });
            return chai.request(server)
                .get('/api/todo/get-todos/future/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        /* Case: Future -> lastNonRepTodo !='' */
        it('it should return all next non-repeating future todos', () => {
            encodedObject = commonFunction.encodeToBase64({
                "query": {
                    "length": 25,
                    "start": 0,
                    "sort": { "fromDate": faker.date.past(), "toDate": new Date() },
                    "counter": 0,
                    "lastNonRepTodo": "",
                    "firstNonRepTodo": "",
                    "lastRepTodo": { "base": "main" },
                    "firstRepTodo": "",
                    "repTodos": []
                },
                "criterionDate": { "$gt": "2019-09-17T18:29:59.007Z" }
            });
            return chai.request(server)
                .get('/api/todo/get-todos/future/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        /* Case: Future -> firstNonRepTodo !='' */
        it('it should return all previous non-repeating future todos', () => {
            encodedObject = commonFunction.encodeToBase64({
                "query": {
                    "length": 25,
                    "start": 0,
                    "sort": { "fromDate": faker.date.past(), "toDate": new Date() },
                    "counter": 0,
                    "lastNonRepTodo": "",
                    "firstNonRepTodo": { "base": "main" },
                    "lastRepTodo": "",
                    "firstRepTodo": "",
                    "repTodos": []
                },
                "criterionDate": { "$gt": "2019-09-17T18:29:59.007Z" }
            });
            return chai.request(server)
                .get('/api/todo/get-todos/future/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        /* Case: Future -> last/first todo for next/prev click*/
        it('it should return all previous non-repeating future todos', () => {
            encodedObject = commonFunction.encodeToBase64({
                "query": {
                    "length": 25,
                    "start": 0,
                    "sort": { "fromDate": faker.date.past(), "toDate": new Date() },
                    "counter": 0,
                    "lastNonRepTodo": "",
                    "firstNonRepTodo": { "base": "main" },
                    "lastRepTodo": "",
                    "firstRepTodo": "",
                    "repTodos": [{ "base": "repeated" }]
                },
                "criterionDate": { "$gt": "2019-09-17T18:29:59.007Z" }
            });
            return chai.request(server)
                .get('/api/todo/get-todos/future/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

    });




    describe('/GETALL Todos', () => {
        it('it should return all overdue todos', () => {
            encodedObject = commonFunction.encodeToBase64({ "query": { "length": 5, "start": 0 } });
            return chai.request(server)
                .get('/api/todo/get-todos/overdue/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GETALL Todos', () => {
        it('it should return all repeating todos', () => {
            encodedObject = commonFunction.encodeToBase64({ "query": { "length": 5, "start": 0 } });
            return chai.request(server)
                .get('/api/todo/get-todos/repeating/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GETALL Todos', () => {
        it('it should return all completed todos', () => {
            encodedObject = commonFunction.encodeToBase64({ "query": { "length": 5, "start": 0 } });
            return chai.request(server)
                .get('/api/todo/get-todos/completed/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/POST Task', () => {
    //     before((done) => {
    //
    //         todo = generatedSampleData.createdSampleData("todos", 1);
    //         todo[0].name = 'Todo 4';
    //         let todayDate = new Date();
    //         todayDate.setHours(0);
    //         todayDate.setMinutes(0);
    //         todo[0].start = todayDate;
    //         todo[0].user_id = userBody.id;
    //         done();
    //     });
    //     it('it should POST with success message', () => {
    //         return chai.request(server)
    //             .post('/api/todo/get-todos/overdue')
    //             .set({ Authorization: token })
    //             .send(category[0])
    //             .then((res) => {
    //                 res.should.have.status(201);
    //                 res.body.should.be.a('object');
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Category added successfully');
    //                 res.body.category.should.be.a('object');
    //                 res.body.category.name.should.be.eql(category[0].name);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    describe('/POST Overdue Todo', () => {
        before((done) => {
            todo = generatedSampleData.createdSampleData("todos", 1);
            todo[0].name = 'Todo 1';
            todo[0].categoryId = 1;
            todo[0].user_id = userBody.id;
            todo[0].selectedContacts = [{ id: 1, firstname: 'shifali' }]
            todo[0].repeat = {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        },
                        "repeatVal": "every_day"
                    }
                },
                todo[0].endrepeat = {
                    "endrepeatVal": "on_date",
                    "endrepeatDetail": 1
                }
            done();
        });
        it('it should POST overdue todo', () => {
            return chai.request(server)
                .post('/api/todo/add-todo')
                .set({ Authorization: token })
                .send(todo[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Todo created successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Future Todo', () => {
        before((done) => {
            todo = generatedSampleData.createdSampleData("todos", 1);
            todo[0].name = 'Todo 2';
            todo[0].categoryId = 1;
            todo[0].selectedContacts = [{ id: 1, firstname: 'shifali' }]
            let futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            futureDate.setHours(0);
            futureDate.setMinutes(0);
            todo[0].start = futureDate;
            todo[0].user_id = userBody.id;
            todo[0].repeat = {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        },
                        "repeatVal": "every_day"
                    }
                },
                todo[0].endrepeat = {
                    "endrepeatVal": "on_date",
                    "endrepeatDetail": 1
                }
            done();
        });
        it('it should POST future todo', () => {
            return chai.request(server)
                .post('/api/todo/add-todo')
                .set({ Authorization: token })
                .send(todo[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Todo created successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Today todo', () => {
        before((done) => {
            todo = generatedSampleData.createdSampleData("todos", 1);
            todo[0].name = 'Todo 3';
            todo[0].categoryId = 1;
            todo[0].selectedContacts = [{ id: 1, firstname: 'shifali' }]
            let todayDate = new Date();
            todayDate.setHours(0);
            todayDate.setMinutes(0);
            todo[0].start = todayDate;
            todo[0].user_id = userBody.id;
            todo[0].repeat = {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        },
                        "repeatVal": "every_day"
                    }
                },
                todo[0].endrepeat = {
                    "endrepeatVal": "on_date",
                    "endrepeatDetail": 1
                }
            done();
        });

        it('it should POST today todos', () => {
            return chai.request(server)
                .post('/api/todo/add-todo')
                .set({ Authorization: token })
                .send(todo[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Todo created successfully');
                    //res.body.todo.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should POST today todos for every_day repeat', () => {
            todo[0].repeat.repeatVal = "every_day";
            todo[0].endrepeat, endrepeatDetail = "50";
            return chai.request(server)
                .post('/api/todo/add-todo')
                .set({ Authorization: token })
                .send(todo[0])
                .then((res) => {

                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Todo created successfully');
                    todoId = res.body.todo.id;
                    //res.body.todo.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

    });

    describe('/PUT Task', () => {
        it('it should not UPDATE a task without access token', () => { /* update date */
            return chai.request(server)
                .get('/api/todo/update-date/' + todosBody.id)
                .then((res) => {
                    return chai.request(server)
                        .put('/api/todo/update-date/abc')
                        .set({ Authorization: token })
                        .send({ 'name': 'Unknown' })
                        .then((res) => {
                            res.should.have.status(422);
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should not UPDATE a task without access token', () => { /* update priority */
            return chai.request(server)
                .get('/api/todo/update-priority/' + todosBody.id)
                .then((res) => {
                    return chai.request(server)
                        .put('/api/todo/update-priority/abc')
                        .set({ Authorization: token })
                        .send({ 'name': 'Unknown' })
                        .then((res) => {
                            res.should.have.status(422);
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should not UPDATE a task without access token', () => { /* update complete task */
            return chai.request(server)
                .get('/api/todo/update-complete/' + todosBody.id)
                .then((res) => {
                    return chai.request(server)
                        .put('/api/todo/update-complete/abc')
                        .set({ Authorization: token })
                        .send({ 'name': 'Unknown' })
                        .then((res) => {
                            res.should.have.status(422);
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        it('it should not UPDATE a todo without todo id', () => { /* case date */
            return chai.request(server)
                .get('/api/todo/update-date/' + todosBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    return chai.request(server)
                        .put('/api/todo/update-date/abc')
                        .set({ Authorization: token })
                        .send({ 'name': 'Unknown' })
                        .then((res) => {
                            res.should.have.status(422);
                            res.body.success.should.be.eql(false);
                            res.body.message.should.be.eql("It should have requested todo id.");
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not UPDATE a todo without todo id', () => { /* case priority */
            return chai.request(server)
                .get('/api/todo/update-priority/' + todosBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    return chai.request(server)
                        .put('/api/todo/update-priority/abc')
                        .set({ Authorization: token })
                        .send({ 'name': 'Unknown' })
                        .then((res) => {
                            res.should.have.status(422);
                            res.body.success.should.be.eql(false);
                            res.body.message.should.be.eql("It should have requested todo id.");
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not UPDATE a todo without todo id', () => { /* case completed todo */
            return chai.request(server)
                .get('/api/todo/update-complete/' + todosBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    return chai.request(server)
                        .put('/api/todo/update-complete/abc')
                        .set({ Authorization: token })
                        .send({ 'name': 'Unknown' })
                        .then((res) => {
                            res.should.have.status(422);
                            res.body.success.should.be.eql(false);
                            res.body.message.should.be.eql("It should have requested todo id.");
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        before((done) => {
            repeatData = generatedSampleData.createdSampleData("event_repeats", 1);
            todo = {
                "name": "Todo change",
                "id": todosBody.id,
                "update_type": "date",
                "repeat": {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        },
                        "repeatVal": "every_day"
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "on_date",
                    "endrepeatDetail": 1
                },
            };
            done();
        });

        // it('it should PUT todos', () => {
        //     return chai.request(server)
        //         .put('/api/todo/update-date/' + todosBody.id)
        //         .set({ Authorization: token })
        //         .send(todo)
        //         .then((response) => {
        //             response.should.have.status(200);
        //             response.should.be.json;
        //             response.body.should.be.a('object');
        //             response.body.message.should.be.eql('Todo Updated Successfully');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
        // it('it should PUT todos', () => {
        //     return chai.request(server)
        //         .put('/api/todo/update-priority/' + todosBody.id)
        //         .set({ Authorization: token })
        //         .send(todo)
        //         .then((response) => {
        //             response.should.have.status(200);
        //             response.should.be.json;
        //             response.body.should.be.a('object');
        //             response.body.message.should.be.eql('Todo Updated Successfully');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        it('it should PUT todos', () => {
            return chai.request(server)
                .put('/api/todo/update-complete/' + todosBody.id)
                .set({ Authorization: token })
                .send(todo)
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo Updated Successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });



        it('it should PUT todos id for every_day repeat', () => {
            todo.repeat.repeatVal = "every_day";
            return chai.request(server)
                .put('/api/todo/update-date/' + todoId)
                .set({ Authorization: token })
                .send(todo)
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo Updated Successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        // it('it should PUT todos id for every_day repeat', () => {
        //     todo.repeat.repeatVal = "every_day";
        //     return chai.request(server)
        //         .put('/api/todo/update-priority/' + todoId)
        //         .set({ Authorization: token })
        //         .send(todo)
        //         .then((response) => {
        //             response.should.have.status(200);
        //             response.should.be.json;
        //             response.body.should.be.a('object');
        //             response.body.message.should.be.eql('Todo Updated Successfully');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
        // it('it should PUT todos id for every_day repeat', () => {
        //     todo.repeat.repeatVal = "every_day";
        //     return chai.request(server)
        //         .put('/api/todo/update-complete/' + todoId)
        //         .set({ Authorization: token })
        //         .send(todo)
        //         .then((response) => {
        //             response.should.have.status(200);
        //             response.should.be.json;
        //             response.body.should.be.a('object');
        //             response.body.message.should.be.eql('Todo Updated Successfully');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
    });

    describe('/PUT Task', () => {

        it('it should PUT todos with type complete', () => {
            return chai.request(server)
                .put('/api/todo/update-complete/' + todosBody.id)
                .set({ Authorization: token })
                .send({ 'name': 'Todo change', 'id': todosBody.id, 'update_type': 'complete', 'is_complete': 1 })
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo Updated Successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {

        it('it should PUT todos with type complete and else condition is 0', () => {
            return chai.request(server)
                .put('/api/todo/update-complete/' + todosBody.id)
                .set({ Authorization: token })
                .send({ 'name': 'Todo change', 'id': todosBody.id, 'update_type': 'complete', 'is_complete': 0 })
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo Updated Successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        it('it should PUT todos with type priority', () => {
            return chai.request(server)
                .put('/api/todo/update-priority/' + todosBody.id)
                .set({ Authorization: token })
                .send({ 'name': 'Todo change', 'id': todosBody.id, 'update_type': 'priority', 'is_priority': todosBody.is_priority })
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo Updated Successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        it('it should PUT todos with type date', () => {
            return chai.request(server)
                .put('/api/todo/update-date/' + todosBody.id)
                .set({ Authorization: token })
                .send({ 'name': 'Todo change', 'id': todosBody.id, 'type': 'date', 'startTime': faker.date.past() })
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo Updated Successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        it('it should PUT todos with type complete', () => {
            return chai.request(server)
                .put('/api/todo/update-complete/' + todosBody.id)
                .set({ Authorization: token })
                .send({ 'name': 'Todo change', 'id': todosBody.id, 'type': 'complete' })
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo Updated Successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        before((done) => {
            repeatData = generatedSampleData.createdSampleData("event_repeats", 1);
            todo = {
                "name": "Todo change",
                "id": 1,
                "update_type": "date",
                "repeat": {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        },
                        "repeatVal": "every_day"
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "on_date",
                    "endrepeatDetail": 1
                },
            };
            done();
        });

        // it('it should PUT todos with existing repeat data', () => {
        //     return chai.request(server)
        //         .put('/api/todo/update-date/' + todosBody.id)
        //         .set({ Authorization: token })
        //         .send(todo)
        //         .then((response) => {
        //             response.should.have.status(200);
        //             response.should.be.json;
        //             response.body.should.be.a('object');
        //             response.body.message.should.be.eql('Todo Updated Successfully');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
        // it('it should PUT todos with existing repeat data', () => {
        //     return chai.request(server)
        //         .put('/api/todo/update-priority/' + todosBody.id)
        //         .set({ Authorization: token })
        //         .send(todo)
        //         .then((response) => {
        //             response.should.have.status(200);
        //             response.should.be.json;
        //             response.body.should.be.a('object');
        //             response.body.message.should.be.eql('Todo Updated Successfully');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
        // it('it should PUT todos with existing repeat data', () => {
        //     return chai.request(server)
        //         .put('/api/todo/update-complete/' + todosBody.id)
        //         .set({ Authorization: token })
        //         .send(todo)
        //         .then((response) => {
        //             response.should.have.status(200);
        //             response.should.be.json;
        //             response.body.should.be.a('object');
        //             response.body.message.should.be.eql('Todo Updated Successfully');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
    });

    describe('/POST Task', () => {
        it('it should not BULK UPDATE a task without access token', () => {
            return chai.request(server)
                .post('/api/todo/bulk-update')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not BULK UPDATE a task without access token', () => {
            return chai.request(server)
                .post('/api/todo/bulk-change-cat')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not BULK UPDATE a task without access token', () => {
            return chai.request(server)
                .post('/api/todo/bulk-change-due-date')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not BULK UPDATE a task without access token', () => {
            return chai.request(server)
                .post('/api/todo/bulk-mark-completed')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not BULK UPDATE a task without access token', () => {
            return chai.request(server)
                .post('/api/todo/bulk-change-to-active')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todo = {};
            todo.ids = [];
            todo.selectedTodosList = [];
            done();
        });
        it('it should not bulk UPDATE a todo without a todo id', () => {
            return chai.request(server)
                .post('/api/todo/bulk-update')
                .set({ Authorization: token })
                .send(todo)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("Please select atleast one list!");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not bulk UPDATE a todo without a todo id', () => {
            return chai.request(server)
                .post('/api/todo/bulk-change-cat')
                .set({ Authorization: token })
                .send(todo)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("Please select atleast one list!");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not bulk UPDATE a todo without a todo id', () => {
            return chai.request(server)
                .post('/api/todo/bulk-change-due-date')
                .set({ Authorization: token })
                .send(todo)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("Please select atleast one list!");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not bulk UPDATE a todo without a todo id', () => {
            return chai.request(server)
                .post('/api/todo/bulk-mark-completed')
                .set({ Authorization: token })
                .send(todo)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("Please select atleast one list!");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
        it('it should not bulk UPDATE a todo without a todo id', () => {
            return chai.request(server)
                .post('/api/todo/bulk-change-to-active')
                .set({ Authorization: token })
                .send(todo)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("Please select atleast one list!");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST bulk update todo', () => {

        before((done) => {
            todo = {};
            todo.ids = [1, 2];
            todo.selectedTodosList = [{ "base": "repeated" }];
            todo.type = 'delete'
            done();
        });

        it('it should bulk update todos with array of selectedTodosList type is delete', () => {
            return chai.request(server)
                .post('/api/todo/bulk-update')
                .set({ Authorization: token })
                .send(todo)
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo updated successfully.');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST bulk update todo', () => {

        before((done) => {
            todo = {};
            todo.ids = [1, 2];
            todo.type = 'change-category';
            todo.category_id = 1;
            done();
        });

        // it('it should bulk update todos with array of ids type is change-category', () => {
        //     return chai.request(server)
        //         .post('/api/todo/bulk-change-cat')
        //         .set({ Authorization: token })
        //         .send(todo)
        //         .then((response) => {
        //             response.should.have.status(200);
        //             response.should.be.json;
        //             response.body.should.be.a('object');
        //             response.body.message.should.be.eql('Todo updated successfully.');
        //         }).catch(function(err) {
        //             return Promise.reject(err);
        //         });
        // });
    });

    describe('/POST bulk update todo', () => {

        before((done) => {
            todo = {};
            todo.ids = [1, 2];
            todo.type = 'mark-completed';
            todo.is_complete = 0;
            todo.completed_date = moment().format("YYYY-MM-DD h:mm:ss");
            todo.selectedTodosList = [{ "base": "repeated" }];
            done();
        });

        it('it should bulk update todos with array of selectedTodosList type is mark-completed', () => {
            return chai.request(server)
                .post('/api/todo/bulk-mark-completed')
                .set({ Authorization: token })
                .send(todo)
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo updated successfully.');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST bulk update todo', () => {

        before((done) => {
            todo = {};
            todo.ids = [1, 2];
            todo.type = 'change_due_date';
            todo.dateData = {};
            todo.dateData.start = moment().format("YYYY-MM-DD h:mm:ss");
            todo.dateData.end = moment().format("YYYY-MM-DD h:mm:ss");
            done();
        });

        it('it should bulk update todos with array of ids type is change_due_date', () => {
            return chai.request(server)
                .post('/api/todo/bulk-change-due-date')
                .set({ Authorization: token })
                .send(todo)
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo updated successfully.');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST bulk update todo', () => {

        before((done) => {
            todo = {};
            todo.ids = [1, 2];
            todo.type = 'change_to_active';
            todo.is_complete = 0;
            todo.selectedTodosList = [{ "base": "repeated" }];
            done();
        });

        it('it should bulk update todos with array of ids type is change_to_active', () => {
            return chai.request(server)
                .post('/api/todo/bulk-change-to-active')
                .set({ Authorization: token })
                .send(todo)
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Todo updated successfully.');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        it('it should not get category todos without access token', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai.request(server)
                .get('/api/todo/get-category-todo/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        it('it should not get category todos without a catgegory id', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai.request(server)
                .get('/api/todo/get-category-todo/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("Category id required");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST bulk update todo', () => {

        before((done) => {
            todo.category_id = 3;
            todo, todoList = [];
            done();
        });

        it('it should not return any todos if todo length is zero', () => {
            encodedObject = commonFunction.encodeToBase64(todo);
            return chai.request(server)
                .get('/api/todo/get-category-todo/'+encodedObject)
                .set({ Authorization: token })
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('No todo found');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            todos[0].user_id = userBody.id;
            todos[0].is_complete = 1;
            commonFunction.addDataToTable("todos", todos[0]).then((data) => {
                todosBody = data;
                done();
            });
        });
        it('it should add a todo', () => {
            encodedObject = commonFunction.encodeToBase64({ "query": { "length": 5, "start": 0 } });
            return chai.request(server)
                .get('/api/todo/get-todos/completed/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    const body = res.body;
                    res.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.should.be.a("object");
                    const firstdata = body.todo[0];
                    firstdata.should.have.property("id").that.is.a("number");
                    firstdata.should.have.property("name").that.is.a("string");
                    firstdata.should.have.property("formatted_date");
                    firstdata.should.have.property("startTime");
                    firstdata.should.have.property("endTime");
                    firstdata.should.have.property("is_priority");
                    firstdata.should.have.property("is_complete");
                    firstdata.should.have.property("start");
                    firstdata.should.have.property("end");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/POST Task', () => {
        it('it should not delete category without access token', () => {
            return chai.request(server)
                .post('/api/todo/delete-category')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            category = generatedSampleData.createdSampleData("categories", 1);
            category[0].category_id = 1;
            //category[0].name = 'category delete';
            done();
        });
        it('it should delete category if category id is provided', () => {
            return chai.request(server)
                .post('/api/todo/delete-category')
                .set({ Authorization: token })
                .send(category[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Category deleted successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/POST Task', () => {
        before((done) => {
            category = generatedSampleData.createdSampleData("categories", 1);
            category[0].category_id = 1;
            category[0].selected_cat = 2;
            done();
        });
        it('it should delete category if selected category id is provided', () => {
            return chai.request(server)
                .post('/api/todo/delete-category')
                .set({ Authorization: token })
                .send(category[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Category deleted successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            category = generatedSampleData.createdSampleData("categories", 1);
            category[0].category_id = 'abc';
            done();
        });
        it('it should delete category if no todos are associated with the category id', () => {
            return chai.request(server)
                .post('/api/todo/delete-category')
                .set({ Authorization: token })
                .send(category[0])
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Category deleted successfully');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            category = generatedSampleData.createdSampleData("categories", 1);
            done();
        });
        it('it should not delete category if no category id is provided', () => {
            return chai.request(server)
                .post('/api/todo/delete-category')
                .set({ Authorization: token })
                .send(category[0])
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("It should have requested category id.");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET Task', () => {
        it('it should not get month todos without access token', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai.request(server)
                .get('/api/todo/get-month-todos/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            let futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            todos[0].type = "future";
            todos[0].month = moment.utc(futureDate).format("MMMM YYYY");
            done();
        });
        it('it should get all todos for a future month', () => {
            encodedObject = commonFunction.encodeToBase64(todos[0]);
            return chai.request(server)
                .get('/api/todo/get-month-todos/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            todos[0].type = "overdue";
            todos[0].month = moment.utc(faker.date.past()).format("MMMM YYYY");
            done();
        });
        it('it should get all todos for a past month', () => {
            encodedObject = commonFunction.encodeToBase64(todos[0]);
            return chai.request(server)
                .get('/api/todo/get-month-todos/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            todos[0].type = "overdue";
            todos[0].month = '';
            done();
        });
        it('it should not get todos without a date', () => {
            encodedObject = commonFunction.encodeToBase64(todos[0]);
            return chai.request(server)
                .get('/api/todo/get-month-todos/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("It should have requested month.");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/Static function ', () => {
        let todo = {};
        before((done) => {
            todo = todo = {
                "name": "Todo change",
                "id": 1,
                "update_type": "date",
                "repeat": {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        },
                        "repeatVal": "every_day"
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "on_date",
                    "endrepeatDetail": 1
                },
            };
            done();
        });
        it('It should run repeat every day', async() => {
            todo.repeat.repeatVal = "every_day";
            let repeatedData = await updateTodoRepeats(todo);
            expect(repeatedData).to.eql(undefined);
        })

        it('It should run repeat every month', async() => {
            todo.repeat.repeatVal = "every_month";
            let repeatedData = await updateTodoRepeats(todo);
            expect(repeatedData).to.eql(undefined);
        })

        it('It should run repeat every week', async() => {
            todo.repeat.repeatVal = "every_week";
            let repeatedData = await updateTodoRepeats(todo);
            expect(repeatedData).to.eql(undefined);
        })

        it('It should run repeat every year', async() => {
            todo.repeat.repeatVal = "every_year";
            let repeatedData = await updateTodoRepeats(todo);
            expect(repeatedData).to.eql(undefined);
        })

        it('It should run repeat custom daily', async() => {
            todo.repeat.repeatVal = "custom";
            todo.repeat.repeatDetails.repeatDetailsValue = "daily"
            let repeatedData = await updateTodoRepeats(todo);
            expect(repeatedData).to.eql(undefined);
        })

        it('It should run repeat custom weekly', async() => {
            todo.repeat.repeatVal = "custom";
            todo.repeat.repeatDetails.repeatDetailsValue = "weekly";
            todo.repeat.repeatDetails.repeatInnerDetails.weekly.weekday = ['W', 'M'];
            let repeatedData = await updateTodoRepeats(todo);
            expect(repeatedData).to.eql(undefined);
        })

        it('It should run repeat custom monthly', async() => {
            todo.repeat.repeatVal = "custom";
            todo.repeat.repeatDetails.repeatDetailsValue = "monthly";
            todo.repeat.repeatDetails.repeatInnerDetails.monthly.monthday = [1, 2, 3];
            let repeatedData = await updateTodoRepeats(todo);
            todo.repeat.repeatDetails.repeatInnerDetails.monthly.type = "on";
            expect(repeatedData).to.eql(undefined);
        })

        it('It should run repeat custom yearly', async() => {
            todo.repeat.repeatVal = "custom";
            todo.repeat.repeatDetails.repeatDetailsValue = "yearly";
            todo.repeat.repeatDetails.repeatInnerDetails.yearly.yearmonth = [1, 2];
            let repeatedData = await updateTodoRepeats(todo);
            todo.repeat.repeatDetails.repeatInnerDetails.monthly.type = "on";
            expect(repeatedData).to.eql(undefined);
        })



    });

    describe('/POST Task', () => {
        it('it should not get parent todo without access token', () => {
            encodedObject = commonFunction.encodeToBase64(todos[0]);
            return chai.request(server)
                .get('/api/todo/get-parent-todo/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            todos[0].parent = 0;
            done();
        });
        it('it should not get todos without a date', () => {
            encodedObject = commonFunction.encodeToBase64(todos[0]);
            return chai.request(server)
                .get('/api/todo/get-parent-todo/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            todos = generatedSampleData.createdSampleData("todos", 1);
            todos[0].parent = 1;
            done();
        });
        it('it should not get todos without a date', () => {
            encodedObject = commonFunction.encodeToBase64(todos[0]);
            return chai.request(server)
                .get('/api/todo/get-parent-todo/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        before((done) => {
            todo = {
                name: 'Todo 103',
                startTime: faker.date.past(),
                is_complete: 0,
                priority: 1,
                completed_date: new Date(),
                is_all_day: 1
            }
            done();
        });
        it('it should add todo will all day and get in parent', () => {
            return chai.request(server)
                .post('/api/todo/add-todo')
                .set({ Authorization: token })
                .send(todo)
                .then((res) => {
                    encodedObject = commonFunction.encodeToBase64(res.body.todo);
                    return chai.request(server)
                        .get('/api/todo/get-parent-todo/'+encodedObject)
                        .set({ Authorization: token })
                        .then((response) => {
                            response.should.have.status(200);
                            response.body.success.should.be.eql(true);
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        before((done) => {
            todo = {
                name: 'Todo 103',
                startTime: faker.date.past(),
                is_complete: 0,
                priority: 1,
                completed_date: new Date(),
                is_all_day: 0
            }
            done();
        });
        it('it should add todo will not all day and get in parent', () => {
            return chai.request(server)
                .post('/api/todo/add-todo')
                .set({ Authorization: token })
                .send(todo)
                .then((res) => {
                    encodedObject = commonFunction.encodeToBase64(res.body.todo);
                    return chai.request(server)
                        .get('/api/todo/get-parent-todo/'+encodedObject)
                        .set({ Authorization: token })
                        .then((response) => {
                            response.should.have.status(200);
                            response.body.success.should.be.eql(true);
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });


});