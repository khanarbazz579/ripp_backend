const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, permission_set, permissions, contact, app, app_user;

describe('Website tracking apps:: Analytic App User', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb([
            'notes',
            'sales_stage_transitions',
            'lost_lead_fields',
            'sales_stage_counters',
            'company_details',
            'companies',
            'contact_details',
            'contacts',
            'form_default_fields',
            'lead_client_details',
            'user_details',
            'custom_fields',
            'sections',
            'leads_clients',
            'supplier_details',
            'suppliers',
            'sales_stages',
            'user_has_permissions',
            'user_has_permission_sets',
            'permission_sets_has_permissions',
            'permission',
            'permission_sets',
            'users',
            "user_roles",
            "analytic_apps",
            "analytics_app_activities",
            "analytic_app_users"
        ]).then(async () => {
            role = generatedSampleData.createdSampleData("user_roles", 1);
            permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 2);
            permissions = generatedSampleData.createdSampleData('permissions', 5);
            user[0].email = 'ripple.cis2018@gmail.com';

            for (let i = 0; i < permissions.length; i++) {
                permissions[i] = await commonFunction.addDataToTable('permission', permissions[i]);
            }

            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user[0].role_id = role_data.id;
                user[1].role_id = role_data.id;
                permission[0].created_by = 1;
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    permission_set = permission_data;
                    user[0].permission_set_id = permission_data.id;
                    user[1].permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user[0]).then((data) => {

                        user[0].id = data.id;
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
                                    contact = data;
                                })
                            });
                        });
                        commonFunction.addDataToTable("users", user[1]).then((data) => {
                            user[1].id = data.id;
                        });

                        commonFunction.addDataToTable('user_has_permission_sets', {
                            user_id: user[0].id,
                            permission_set_id: permission_data.id
                        });

                        commonFunction.addDataToTable("analytic_apps", {
                            url: 'http://localhost-app.com',
                            user_id: user[0].id,
                            form_id: '123456qwerty'
                        })
                        .then((data) => {
                            app = data;
                            commonFunction.addDataToTable('analytic_app_users', {
                                analytic_app_id: app.id,
                                user_type: 'UNMAPPED USER',
                                email: 'test-user@localhost.com',
                                browser_fingerprint: 'qwerty123456',
                            })
                            .then(data => {
                                app_user = data;
                                done();
                            });
                            
                        });
                    })
                })
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
                token = { Authorization: res.body.token };
                loggedInUser = res.body.user;
                res.body.user.should.be.a('object');
                res.body.user.first_name.should.be.eql(user[0].first_name);
                res.body.user.last_name.should.be.eql(user[0].last_name);
                res.body.user.email.should.be.eql(user[0].email);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    describe('Get', function() {

        let request, endPoint;

        beforeEach((done) => {
            request = {
                email: ''
            };
            endPoint = '/api/rta/user';
            done()
        });

        before(done => {
            userBody = user[0]
            done()
        })

        it('Should not get any user without email', () => {
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Cannot find this user!')
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get any user with non existent email contact', () => {
            request.email = 'test@example.com'
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Cannot find this user!')
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get user with existent email contact', () => {
            request.email = contact.email;
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object')
                    res.body.payload.email.should.be.eql(request.email)
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Synchronize user data', () => {

        let request, endPoint, tempUser, app;

        before(done => {
            endPoint = '/api/rta/user/sync';

            commonFunction.addDataToTable("analytic_apps", {
                url: 'http://localhost.com',
                user_id: user[0].id,
                form_id: '123456qwerty'
            })
            .then((data) => {
                app = data;
                request = {
                    email: 'test@localhost.com',
                    app_id: app.id,
                    fingerprint: 'q1w2e4re5r6t7t89',
                };

                commonFunction.addDataToTable('analytic_app_users', {
                    analytic_app_id: app.id,
                    user_type: 'UNMAPPED USER',
                    email: 'test1@localhost.com',
                    app_id: app.id,
                    browser_fingerprint: 'q1w2e4re2343246t7t89',
                })
                .then(data => {
                    tempUser = data;
                    done();
                });
                
            });
        });

        it('Should create a temporary user', () => {
            request.email = '';
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should update a temporary user', () => {
            request.analytic_app_user_id = tempUser.id;
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.id.should.be.eql(tempUser.id);
                    tempuser = res.body.payload;
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        })

        it('Should create a temporary user with existent contact', () => {
            request.email = contact.email;
            request.fingerprint = '1q2w3e4r5t6y7u8i9o0p';
            delete request.analytic_app_user_id;

            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.email.should.be.eql(contact.email);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        })

        it('Should update referred from status as email', () => {
            commonFunction.addDataToTable('analytic_app_users', {
                    analytic_app_id: app.id,
                    user_type: 'UNMAPPED USER',
                    app_id: app.id,
                    browser_fingerprint: 'q1w2e4re2343246t7t891',
                    email: ''
                })
                .then(data => {
                    return chai.request(server)
                        .post(endPoint)
                        .send({
                            email: 'test2@localhost.com',
                            fingerprint: 'q1w2e4re2343246t7t891',
                        })
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.status.should.be.eql(true);
                            res.body.payload.should.be.a('object');
                            res.body.payload.email.should.be.eql('test2@localhost.com');
                        })
                        .catch(function (err) {
                            return Promise.reject(err);
                        });                    
                });
        })

        it('Should update referred from status as email', () => {
            commonFunction.sequalizedDb(['analytic_app_users']).
                then(() => {
                    return commonFunction.addDataToTable('analytic_app_users', {
                        analytic_app_id: app.id,
                        user_type: 'UNMAPPED USER',
                        app_id: app.id,
                        browser_fingerprint: '12',
                        email: ''
                    });
                })
                 .then(data => {
                    return chai.request(server)
                        .post(endPoint)
                        .send({
                            email: contact.email,
                            fingerprint: '12',
                            referrer: 'http://google.com'
                        })
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.status.should.be.eql(true);
                            res.body.payload.should.be.a('object');
                            res.body.payload.email.should.be.eql(contact.email);
                            res.body.payload.user_id.should.not.be.eql();
                        })                 
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });   
        });
    });

    describe('update user data', () => {

        let request, endPoint, tempUser, app;

        before(done => {
            commonFunction.addDataToTable("analytic_apps", {
                url: 'http://localhost-app.com',
                user_id: user[0].id,
                form_id: '123456qwerty'
            })
            .then((data) => {
                app = data;
                commonFunction.addDataToTable('analytic_app_users', {
                    analytic_app_id: app.id,
                    user_type: 'UNMAPPED USER',
                    email: 'test-user@localhost.com',
                    browser_fingerprint: 'qwerty123456'
                })
                .then(data => {
                    tempUser = data;
                    endPoint = '/api/rta/user/'+data.id;
                    done();
                });
            });
        });

        it('Should not update with invalid id', () => {
            return chai.request(server)
                .put('/api/rta/user/'+12132)
                .send({
                    email: contact.email,
                    fingerprint: 'q1w2e4re2343246t7t891',
                    referrer: 'http://google.com'
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Cannot find this user!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });  
        });

        it('Should update status', () => {
            
            return chai.request(server)
                .put(endPoint)
                .send({
                    is_active: false,
                    time: new Date(),
                    device: 'Desktop'
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });  
        });

        it('Should update status 2', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    is_active: true,
                    time: new Date(),
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });  
        });

        it('Should update status 3', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    is_active: false,
                    time: new Date(),
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });  
        });

    });
});