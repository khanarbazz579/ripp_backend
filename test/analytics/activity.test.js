const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, permission_set, permissions, contact, app, app_user;

describe('Website tracking apps:: Analytic App User Activity', () => {
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
                analytic_app_user_id: ''
            };
            endPoint = '/api/rta/activity';
            done()
        });

        it('Should not get any activity without id', () => {
            return chai.request(server)
                .get(endPoint)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Invalid app user id!')
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get any activity with non existent id', () => {
            request.analytic_app_user_id = '123';
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('No such user exists!')
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get activity with user, as no activity is present', () => {
            request.analytic_app_user_id = app_user.id;
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('No activity defined for this userat the moment!')
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

     describe('Create', function() {

        let request, endPoint;

        before((done) => {
            request = {
                analytic_app_user_id: '',
                access_device:{
                    device: {
                        type: 'Desktop'
                    }
                }
            };
            endPoint = '/api/rta/activity';
            done()
        });

        it('Should not create activity with no user', () => {
            return chai.request(server)
                .post(endPoint)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Invalid user!')
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create activity with invalid user', () => {
            return chai.request(server)
                .post(endPoint)
                .send({
                    analytic_app_user_id: '123456'
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('No such user exists!')
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should create activity user', () => {
            request.analytic_app_user_id = app_user.id;
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.analytic_app_user_id.should.be.eql(request.analytic_app_user_id);

                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get activity with user', () => {
            request.analytic_app_user_id = app_user.id;
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.analytic_app_user_id.should.be.eql(request.analytic_app_user_id);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create activity for existing activity', () => {
            request.analytic_app_user_id = app_user.id;
            request.analytic_app_user_id = app_user.id;
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Cannot create activity for this user, already exists!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('Update', () => {

    //     let request, endPoint;

    //     before((done) => {
    //         request = {
    //             analytic_app_user_id: '',
    //             access_device:{
    //                 device: {
    //                     type: 'Desktop'
    //                 }
    //             }
    //         };
    //         endPoint = '/api/rta/activity';
    //         done()
    //     });

    //     it('Should not update activity with no user', () => {
    //         return chai.request(server)
    //             .put(endPoint)
    //             .then((res) => {
    //                 res.should.have.status(422);
    //                 res.body.status.should.be.eql(false);
    //                 res.body.message.should.be.eql('Invalid activity id')
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('Should not update activity with invalid user', () => {
    //         return chai.request(server)
    //             .put(endPoint)
    //             .send({
    //                 analytic_app_user_id: '213'
    //             })
    //             .then((res) => {
    //                 res.should.have.status(422);
    //                 res.body.status.should.be.eql(false);
    //                 res.body.message.should.be.eql('No such user exists!');
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('Should update activity with user', () => {
    //         request.analytic_app_user_id = app_user.id;
    //         return chai.request(server)
    //             .put(endPoint)
    //             .send(request)
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.status.should.be.eql(true);
    //                 res.body.payload.should.be.a('object');
    //                 res.body.payload.analytic_app_user_id.should.be.eql(request.analytic_app_user_id);
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('Should update activity with more data', () => {
    //         request.analytic_app_user_id = app_user.id;
    //         request.access_device.device.type = 'Android';
    //         request.pages_viewed = [{url: 'test.com'}];
    //         request.visits = true;
    //         return chai.request(server)
    //             .put(endPoint)
    //             .send(request)
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.status.should.be.eql(true);
    //                 res.body.payload.should.be.a('object');
    //                 res.body.payload.analytic_app_user_id.should.be.eql(request.analytic_app_user_id);
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('Should not update activity when no activity exists', () => {
    //         commonFunction.sequalizedDb([
    //             'analytics_app_activities'
    //         ]).then(data => {
    //             return chai.request(server)
    //                 .put(endPoint)
    //                 .send(request)
    //                 .then((res) => {
    //                     res.should.have.status(422);
    //                     res.body.status.should.be.eql(false);
    //                     res.body.message.should.be.eql('No activity exists for this user!');
    //                 })
    //                 .catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         })
    //     });

    // });

});