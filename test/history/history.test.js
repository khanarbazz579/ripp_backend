const chai = require('chai');
const chaiHttp = require('chai-http');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const server = require('../../app');

const should = chai.should();
const modelName = 'histories';

chai.use(chaiHttp);

let loggedInUser, roleBody, setBody, userBody, eventBody, eventRecipientBody, todoContactBody; 
let leadBody, noteBody, salesStageBody, token, taskBody, historyBody, todosBody;

afterEach(() => {
    let key;
    for (key in this) {
        delete this[key];
    };
});

describe('Histories', () => {

    describe('/POST Login History', () => {
        before((done) => {  
            commonFunction.sequalizedDb(["notes", "histories", "leads_clients", "users", "user_roles", "permission_sets", "sales_stages", "tasks", "todos" ]).then(() => {
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
                            sales = generatedSampleData.createdSampleData("sales_stages", 1);
                            sales[0].user_id = userBody.id;
                            commonFunction.addDataToTable("sales_stages", sales[0]).then((data) => {
                                salesStageBody = data;
                                leadBody = generatedSampleData.createdSampleData("leads_clients", 1);
                                leadBody[0].sales_stage_id = salesStageBody.id;
                                leadBody[0].user_id = userBody.id;
                                commonFunction.addDataToTable("leads_clients", leadBody[0]).then((data) => {
                                    leadBody = data;
                                    contacts = generatedSampleData.createdSampleData("contacts", 1);
                                    contacts[0].entity_id = leadBody.id;
                                    contacts[0].entity_type = "LEAD_CLIENT";
                                    commonFunction.addDataToTable("contacts", contacts[0]).then((data) => {
                                        contactBody = data;
                                        task = generatedSampleData.createdSampleData("tasks", 1);
                                        task[0].user_id = userBody.id;
                                        task[0].contact_id = contactBody.id;
                                        commonFunction.addDataToTable("tasks", task[0]).then((data) => {
                                            taskBody = data;
                                            todos = generatedSampleData.createdSampleData("todos", 1);
                                            todos[0].user_id = userBody.id;
                                            commonFunction.addDataToTable("todos", todos[0]).then((data) => {
                                                todosBody = data;
                                                events = generatedSampleData.createdSampleData("events", 1);
                                                events[0].user_id = userBody.id;
                                                commonFunction.addDataToTable("events", events[0]).then((data) => {
                                                    eventBody = data;
                                                    done();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        })
                    });    
                });
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

    describe('/POST History', () => {
        before((done) => {
            history = generatedSampleData.createdSampleData(modelName, 1);
            history[0].user_id = loggedInUser.id;
            history[0].contact_id = contactBody.id;
            history
            done();
        });

        it('it should not POST a history using unauthorized user', () => {
            return chai.request(server)
                .post('/api/history')
                .send(history[0])
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe('/POST Note', () => {
        before((done) => {
            note = generatedSampleData.createdSampleData("notes", 1);
            note[0].entity_id = contactBody.id;
            note[0].entity_type = "CONTACT";
            note[0].note = "";
            noteBody = note[0];
            done();
        });

        it('it should not POST a note without note', () => {
            return chai.request(server)
                .post('/api/note')
                .set({ Authorization: token })
                .send(noteBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Note', () => {
        before((done) => {
            noteBody.note = "Any note";
            done();
        });

        it('it should POST a note with note', () => {
            return chai.request(server)
                .post('/api/note')
                .set({ Authorization: token })
                .send(noteBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Note created successfully.');
                    res.body.note.entity_type.should.be.eql(noteBody.entity_type);
                    res.body.note.note.should.be.eql(noteBody.note);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST History', () => {
        before((done) => {
            note = generatedSampleData.createdSampleData("notes", 1);
            note[0].entity_id = contactBody.id;
            note[0].entity_type = "CONTACT";
            commonFunction.addDataToTable("notes", note[0]).then((data) => {
                noteBody = data;
                history = generatedSampleData.createdSampleData("histories", 1);
                history[0].entity_id = noteBody.id;
                history[0].contact_id = contactBody.id;
                done();
            });
        });

        it('it should POST a history with note', () => {
            return chai.request(server)
                .post('/api/history')
                .set({ Authorization: token })
                .send(history[0])
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.history.should.be.a('object');
                    res.body.history.note.id.should.be.eql(noteBody.id);
                    historyBody = res.body.history;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET lead History', () => {

        before((done) => {
            let event_recipient = generatedSampleData.createdSampleData("event_recipients", 1);
            event_recipient[0].event_id = eventBody.id;
            event_recipient[0].contact_id = contactBody.id;
            commonFunction.addDataToTable("event_recipients", event_recipient[0]).then((data) => {
                eventRecipientBody = data;
                let todo_contacts = generatedSampleData.createdSampleData("todo_contacts", 1);
                todo_contacts[0].todo_id = todosBody.id;
                todo_contacts[0].contact_id = contactBody.id;
                commonFunction.addDataToTable("todo_contacts", todo_contacts[0]).then((data) => {
                    todoContactBody = data;
                    done();
                });
            });
        });

        it('it should not GET a history without lead id', () => {
            return chai.request(server)
                .get('/api/leadHistory/abc')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("It should have requested lead id.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should GET a history of lead', () => {
            return chai.request(server)
                .get('/api/leadHistory/' + leadBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.history.should.be.a('array');
                    res.body.history[0].contact.id.should.be.eql(contactBody.id);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET Contact History', () => {

        it('it should not GET a history without contact id', () => {
            return chai.request(server)
                .get('/api/contactHistory/abc')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("It should have requested contact id.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });


        it('it should GET a history of contact', () => {
            return chai.request(server)
                .get('/api/contactHistory/' + contactBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.history.should.be.a('array');
                    res.body.history[0].contact.id.should.be.eql(contactBody.id);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT History', () => {
        it('it should not UPDATE history without access token', () => {
            return chai.request(server)
                .put('/api/history/' + historyBody.id)
                .send({ 'lead_client_id': 2 })
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT History', () => {
        it('it should not UPDATE a history without history id', () => {
            return chai.request(server)
                .get('/api/history/' + historyBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    return chai.request(server)
                        .put('/api/history/abc')
                        .set({ Authorization: token })
                        .send({ 'lead_client_id': 2 })
                        .then((response) => {
                            response.should.have.status(401);
                            response.body.success.should.be.eql(false);
                            response.body.message.should.be.eql("It should have requested history id.");
                        }).catch(function (err) {
                            return Promise.reject(err);
                        });
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT History', () => {
        it('it should UPDATE History', () => {
            return chai.request(server)
                .put('/api/history/' + historyBody.id)
                .set({ Authorization: token })
                .send({ 'lead_client_id': 2 })
                .then((response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/DELETE History', () => {
        it('it should not DELETE history without access token', () => {
            return chai.request(server)
                .delete('/api/history/' + historyBody.id)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE History', () => {
        it('it should not DELETE a history without history id', () => {
            return chai.request(server)
                .delete('/api/history/abc')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(401);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("It should have requested history id.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE History', () => {
        it('it should DELETE History', () => {
            return chai.request(server)
                .delete('/api/history/' + historyBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql("Deleted History.");
                    res.should.be.json;
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

});
