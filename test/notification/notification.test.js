const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let user, userBody, leadBody, salesStageBody, token, taskBody, loggedInUser, notificationBody, contactBody;

describe('login', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { 
        commonFunction.sequalizedDb([ 'user_details', 'tasks', 'notifications','sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'leads_clients', 'suppliers', 'sales_stages', 'permission_sets', 'users', 'user_roles', 'permission_sets']).then(() => {
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

describe('/BULK UPDATE Notifications', () => {
    
    let updateNotificationBody;

    before((done)=>{
        let notification = {
            type: "CALL",    
            target_time: new Date(), 
            user_id: loggedInUser.id, 
            target_event_id: taskBody.id 
        }
        commonFunction.addDataToTable("notifications", notification).then((data) => {
            notificationBody = data;
            updateNotificationBody = {}
            done();
        });
    })

    it('it should not BULK UPDATE Notifications without authorization', () => {
        return chai.request(server)
            .post('/api/notification/bulkUpdateNotification')
            .send(updateNotificationBody)
            .then((res) => {
                updateNotificationBody = {
                    data: {
                        is_miss : 1
                    } 
                }
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should not BULK UPDATE Notifications without user criteria', () => {
        return chai.request(server)
            .post('/api/notification/bulkUpdateNotification')
            .set({ Authorization: token })
            .send(updateNotificationBody)
            .then((res) => {
                updateNotificationBody = {
                    criteria: {
                        user_id: loggedInUser.id
                    }
                }
                res.should.have.status(401);
                res.body.success.should.be.eql(false);
                res.body.message.should.be.eql("Criteria is required.");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should not BULK UPDATE Notifications without user data', () => {
        return chai.request(server)
            .post('/api/notification/bulkUpdateNotification')
            .set({ Authorization: token })
            .send(updateNotificationBody)
            .then((res) => {
                updateNotificationBody = {
                    criteria: {
                        user_id: loggedInUser.id
                    },
                    data: {
                        is_miss : 1
                    } 
                } 
                res.should.have.status(401);
                res.body.success.should.be.eql(false);
                res.body.message.should.be.eql("Data to be updated is required.");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should BULK UPDATE Notifications with authorization', () => {
        return chai.request(server)
            .post('/api/notification/bulkUpdateNotification')
            .send(updateNotificationBody)
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.message.should.be.eql("Notification updated successfully.");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});


describe('/UPDATE Notifications', () => {

    it('it should not UPDATE Notifications without authorization', () => {
        return chai.request(server)
            .put('/api/notification/'+notificationBody.id)
            .send(notificationBody)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should not UPDATE Notifications without valid user id', () => {
        return chai.request(server)
            .put('/api/notification/abc')
            .set({ Authorization: token })
            .send(notificationBody)
            .then((res) => {
                res.should.have.status(401);
                res.body.success.should.be.eql(false);
                res.body.message.should.be.eql("It should have requested id.");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should UPDATE Notifications with valid user id', () => {
        return chai.request(server)
            .put('/api/notification/'+ notificationBody.id)
            .set({ Authorization: token })
            .send(notificationBody)
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.notificationsReadStatus.should.be.eql(true);
                res.body.message.should.be.eql("Notification updated successfully.");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/UPDATE Get notification setting', () => {
     it('it should not UPDATE global notification setting', () => {
        return chai.request(server)
            .put('/api/notification/globalNotificationSetting/todo')
            .set({ Authorization: token })
            .send({ is_active : 1})
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.message.should.be.eql("Settings updated successfully.");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});


describe('/GETALL Notifications', () => {

    it('it should not GETALL Notifications (Only read status) without authorization', () => {
        return chai.request(server)
            .get('/api/notification/getNotificationReadStatus')
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should GETALL Notifications (Only read status) with authorization', () => {
        return chai.request(server)
            .get('/api/notification/getNotificationReadStatus')
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.notifications.should.be.eql(true);
                res.body.fileNotifications.should.be.a('boolean');
                res.body.activityNotifications.should.be.a('boolean');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should not GETALL Notifications without authorization', () => {
        encodedObject = commonFunction.encodeToBase64(notificationBody);
        return chai.request(server)
            .get('/api/notification/'+encodedObject)
            // .send(notificationBody)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should GETALL Notifications', () => {
        let getAllNotificationBody = {
            min_time: new Date(),
            user_id: loggedInUser.id,
            type: "ALL"
        };
        encodedObject = commonFunction.encodeToBase64(notificationBody);
        return chai.request(server)
            .get('/api/notification/'+encodedObject)
            // .send(notificationBody)
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.notifications.should.be.a('array');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    
});


describe('/GETALL TODO Notifications', () => {

    before((done)=>{
        today = new Date();
        yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); 
        
        let notification = {
            type: "TODO",    
            target_time: yesterday, 
            user_id: loggedInUser.id, 
            target_event_id: 1 
        };

        todos = generatedSampleData.createdSampleData("todos", 1);
        commonFunction.addDataToTable("todos", todos[0]).then((data) => {
            todoBody = data;
            commonFunction.addDataToTable("todo_contacts", { todo_id : todoBody.id, contact_id: contactBody.id }).then((data) => {
                notification['target_event_id'] = todoBody.id;
                commonFunction.addDataToTable("notifications", notification).then((data) => {
                    notificationBody = data;
                    done();
                });
            });
        });
    });

    // it('it should GETALL TODO Notifications', () => {

    //     let getAllNotificationBody = {
    //         min_time: new Date(),
    //         user_id: loggedInUser.id,
    //         type: "TODO"
    //     };

    //     return chai.request(server)
    //         .post('/api/notification')
    //         .send(getAllNotificationBody)
    //         .set({ Authorization: token })
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.success.should.be.eql(true);
    //             res.body.should.be.a('object');
    //             res.body.notifications.should.be.a('array');
    //         }).catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });

    after((done) => { 
        commonFunction.sequalizedDb(['tasks', 'notifications','sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'leads_clients', 'suppliers', 'sales_stages', 'users']).then(() => {
            done();
        });
    });

});

