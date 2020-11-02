const chai = require('chai');
const chaiHttp = require('chai-http');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const server = require('../../app');
const should = chai.should();
chai.use(chaiHttp);

let user, userBody, leadBody, salesStageBody, token, taskBody, taskModelWithData, loggedInUser;

describe('Tasks', () => {

    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => {
        commonFunction.sequalizedDb([ 'call_outcomes_transitions', 'notes', 'histories', 'notifications', 'tasks', 'sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'leads_clients', 'suppliers', 'sales_stages', 'users']).then(() => {
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
                                    tasks = generatedSampleData.createdSampleData("tasks", 1);
                                    tasks[0].user_id = userBody.id;
                                    tasks[0].contact_id = contactBody.id;
                                    commonFunction.addDataToTable("tasks", tasks[0]).then((data) => {
                                        taskBody = data;
                                        console.log("Log is ---------------__>",data);
                                        
                                        done();
                                    });
                                });
                            });
                        })
                    });
                });
            })
        });
    });


    describe('/LOGIN Task', () => {
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
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            taskModelWithData = generatedSampleData.createdSampleData("tasks", 1);
            done()
        });
        it('it should not POST a task without access token', () => {
            return chai.request(server)
                .post('/api/tasks')
                .send(taskModelWithData[0])
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            taskModelWithData[0].contact_id = '';
            done();
        });

        it('it should not POST a task without contact', () => {
            return chai.request(server)
                .post('/api/tasks')
                .set({ Authorization: token })
                .send(taskModelWithData[0])
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("Contact is required.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Task', () => {
        before((done) => {
            task = generatedSampleData.createdSampleData("tasks", 1);
            task[0].user_id = userBody.id;
            task[0].contact_id = contactBody.id;
            task[0].reminder = 10;
            done();
        });
        it('it should POST with reminder time of task', () => {
            return chai.request(server)
                .post('/api/tasks')
                .set({ Authorization: token })
                .send(task[0])
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Task created successfully.');
                    res.body.task.should.be.a('object');
                    res.body.task.user_id.should.be.eql(task[0].user_id);
                    res.body.task.contact_id.should.be.eql(task[0].contact_id);
                    res.body.task.reason_for_call.should.be.eql(task[0].reason_for_call);
                    res.body.task.task_type.should.be.eql(task[0].task_type);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Overdue Task', () => {
        before((done) => {
            task = generatedSampleData.createdSampleData("tasks", 1);
            task[0].user_id = userBody.id;
            task[0].contact_id = contactBody.id;
            done();
        });
        it('it should POST overdue task', () => {
            return chai.request(server)
                .post('/api/tasks')
                .set({ Authorization: token })
                .send(task[0])
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Task created successfully.');
                    res.body.task.should.be.a('object');
                    res.body.task.user_id.should.be.eql(task[0].user_id);
                    res.body.task.contact_id.should.be.eql(task[0].contact_id);
                    res.body.task.reason_for_call.should.be.eql(task[0].reason_for_call);
                    res.body.task.task_type.should.be.eql(task[0].task_type);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Today Task', () => {
        before((done) => {
            task = generatedSampleData.createdSampleData("tasks", 1);
            let todayDate = new Date();
            todayDate.setHours(0);
            todayDate.setMinutes(0);
            task[0].start = todayDate;
            task[0].user_id = userBody.id;
            task[0].contact_id = contactBody.id;
            done();
        });

        it('it should POST today task', () => {
            return chai.request(server)
                .post('/api/tasks')
                .set({ Authorization: token })
                .send(task[0])
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Task created successfully.');
                    res.body.task.should.be.a('object');
                    res.body.task.user_id.should.be.eql(task[0].user_id);
                    res.body.task.contact_id.should.be.eql(task[0].contact_id);
                    res.body.task.reason_for_call.should.be.eql(task[0].reason_for_call);
                    res.body.task.task_type.should.be.eql(task[0].task_type);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Future Task', () => {
        before((done) => {
            task = generatedSampleData.createdSampleData("tasks", 1);
            let futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            futureDate.setHours(0);
            futureDate.setMinutes(0);
            task[0].start = futureDate;
            task[0].user_id = userBody.id;
            task[0].contact_id = contactBody.id;
            done();
        });
        it('it should POST future task', () => {
            return chai.request(server)
                .post('/api/tasks')
                .set({ Authorization: token })
                .send(task[0])
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Task created successfully.');
                    res.body.task.should.be.a('object');
                    res.body.task.user_id.should.be.eql(task[0].user_id);
                    res.body.task.contact_id.should.be.eql(task[0].contact_id);
                    res.body.task.reason_for_call.should.be.eql(task[0].reason_for_call);
                    res.body.task.task_type.should.be.eql(task[0].task_type);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET Task', () => {
        it('it should not GET a task without access token', () => {
            return chai.request(server)
                .get('/api/tasks/' + taskBody.id)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET Task', () => {
        it('it should not GET a task without task id', () => {
            return chai.request(server)
                .get('/api/tasks/abc')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(401);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("It should have requested task id.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET Task', () => {
        it('it should GET task', () => {
            return chai.request(server)
                .get('/api/tasks/' + taskBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.task.should.be.a('object');
                    res.body.task.task_type.should.be.eql(taskBody.task_type);
                    res.body.task.user_id.should.be.eql(taskBody.user_id);
                    res.body.task.contact_id.should.be.eql(taskBody.contact_id);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/GETALL Task', () => {
    //     let date = new Date();
    //     it('it should not GETALL tasks without access token', () => {
    //         return chai.request(server)
    //             .get('/api/allTasks/today'+ date)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/GETALL Overdue Task', () => {
    //     it('it should GET ALL Overdue tasks', () => {
    //         return chai.request(server)
    //             .get('/api/allTasks/overdue')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.should.be.a('object');
    //                 res.body.task.should.have.property('prioritized');
    //                 res.body.task.prioritized.should.be.a('array');
    //                 res.body.task.should.have.property('count');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/GETALL Future Task', () => {
    //     it('it should GET ALL Future tasks', () => {
    //         return chai.request(server)
    //             .get('/api/allTasks/future')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.should.be.a('object');
    //                 res.body.task.should.have.property('prioritized');
    //                 res.body.task.prioritized.should.be.a('array');
    //                 res.body.task.should.have.property('count');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/GETALL Today Task', () => {
    //     it('it should GET ALL Today tasks', () => {
    //         return chai.request(server)
    //             .get('/api/allTasks/today')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.should.be.a('object');
    //                 res.body.task.should.have.property('prioritized');
    //                 res.body.task.prioritized.should.be.a('array');
    //                 res.body.task.should.have.property('count');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    describe('/PUT Task', () => {
        it('it should not UPDATE a task without access token', () => {
            return chai.request(server)
                .get('/api/tasks/' + taskBody.id)
                .then((res) => {
                    return chai.request(server)
                        .put('/api/tasks/abc')
                        .set({ Authorization: token })
                        .send({ 'task_description': 'Unknown' })
                        .then((res) => {
                            res.should.have.status(401);
                        }).catch(function (err) {
                            return Promise.reject(err);
                        });
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        it('it should not UPDATE a task without task id', () => {
            return chai.request(server)
                .get('/api/tasks/' + taskBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    return chai.request(server)
                        .put('/api/tasks/abc')
                        .set({ Authorization: token })
                        .send({ 'task_description': 'Unknown' })
                        .then((res) => {
                            res.should.have.status(401);
                            res.body.success.should.be.eql(false);
                            res.body.message.should.be.eql("It should have requested task id.");
                        }).catch(function (err) {
                            return Promise.reject(err);
                        });
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Task', () => {
        it('it should PUT tasks', () => {
            return chai.request(server)
                .put('/api/tasks/' + taskBody.id)
                .set({ Authorization: token })
                .send({ 'reason_for_call': 'Unknown' })
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                    response.body.message.should.be.eql('Task updated successfully.');
                    response.body.task.user_id.should.be.eql(taskBody.user_id);
                    response.body.task.contact_id.should.be.eql(taskBody.contact_id);
                    response.body.task.reason_for_call.should.be.eql("Unknown");
                    response.body.task.task_type.should.be.eql(taskBody.task_type);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/GETALL Task Count', () => {
    //     it('it should GET ALL tasks count', () => {
    //         return chai.request(server)
    //             .get('/api/taskCount')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.should.be.a('object');
    //                 res.body.task.should.be.a('object');
    //                 res.body.task.should.have.property('overdue');
    //                 res.body.task.should.have.property('today');
    //                 res.body.task.should.have.property('future');
    //                 res.body.task.overdue.should.be.a('number');
    //                 res.body.task.today.should.be.a('number');
    //                 res.body.task.future.should.be.a('number');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/PUT multiple update Task', () => {
    //     let taskIdArray = [];

    //     before((done) => {
    //         newTask = generatedSampleData.createdSampleData("tasks", 3);
    //         for (let index = 0; index < 3; index++) {
    //             newTask[index].user_id = userBody.id;
    //             newTask[index].lead_id = leadBody.id;
    //             taskBody = commonFunction.addDataToTable("tasks", newTask[index]);
    //             taskIdArray.push(taskBody.id)
    //         }
    //         done();
    //     });

    //     it('it should remove(complete) tasks', () => {
    //         let taskParam = { id: taskIdArray, type: "remove" };
    //         return chai.request(server)
    //             .put('/api/bulkUpdate')
    //             .set({ Authorization: token })
    //             .send(taskParam)
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.should.be.json;
    //                 res.body.should.be.a('object');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should rescheduled tasks for today', () => {
    //         let taskParam = { id: taskIdArray, type: "rescheduleToday" };
    //         return chai.request(server)
    //             .put('/api/bulkUpdate')
    //             .set({ Authorization: token })
    //             .send(taskParam)
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.should.be.json;
    //                 res.body.should.be.a('object');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should rescheduled tasks for tomorrow', () => {
    //         let taskParam = { id: taskIdArray, type: "rescheduleTomorrow" };
    //         return chai.request(server)
    //             .put('/api/bulkUpdate')
    //             .set({ Authorization: token })
    //             .send(taskParam)
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.should.be.json;
    //                 res.body.should.be.a('object');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/DELETE Task', () => {
    //     it('it should not DELETE a task without task id', () => {
    //         return chai.request(server)
    //             .delete('/api/tasks/abc')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(401);
    //                 res.body.success.should.be.eql(false);
    //                 res.body.message.should.be.eql("It should have requested task id.");
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    describe('/DELETE Task', () => {
        before((done) => {
            taskModelWithData = generatedSampleData.createdSampleData("tasks", 1);
            taskModelWithData[0].contact_id = contactBody.id;
            commonFunction.addDataToTable("tasks", taskModelWithData[0]).then((data) => {
                taskModelWithData = data;
                done();
            });
        });

        it('it should DELETE task', () => {
            return chai.request(server)
                .post('/api/tasks/')
                .set({ Authorization: token })
                .send(taskModelWithData)
                .then((res) => {
                    res.should.have.status(200);
                    // res.body.success.should.be.eql(true);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    // res.body.message.should.be.eql('Task deleted successfully.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });
});
