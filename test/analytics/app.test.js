const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, permission_set, permissions;

describe('Website tracking apps', () => {
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
                        commonFunction.addDataToTable("users", user[1]).then((data) => {
                            user[1].id = data.id;
                            done();
                        });

                        commonFunction.addDataToTable('user_has_permission_sets', {
                            user_id: user[0].id,
                            permission_set_id: permission_data.id
                        })
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

    describe('Create', function() {

        let request, endPoint;

        beforeEach(() => {
            request = {
                url: 'http://frontend.devsubdomain.com'
            };
            endPoint = '/api/rta/u';
        });

        it('Should not create app without token', () => {
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create app with invalid data', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({})
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('The target url is invalid!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should create app with url', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.url.should.be.eql(request.url);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create app with existing url', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('An app with this URL already exists!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Get', () => {
        let request, endPoint, app;

        before((done) => {
            endPoint = '/api/rta/u';
            chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    url: 'http://frontend.devsubdomain.com1'
                })
                .then((res) => {
                   app = res.body.payload
                   done()
                });
        });

        beforeEach((done) => {
            request = {
                app_id: ''
            };
            done()
        });

        it('Should not get an app without token', () => {
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .then((res) => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get an app with invalid form id', () => {
            request.app_id = 0;
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .query(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('You haven\'t added any websites to track at the moment!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get an app with without query', () => {
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('This app is invalid!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get an app with form id', () => {
            request.app_id = app.id;
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .query(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get an list of all apps by logged in user', () => {
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .query({
                    type: 'all'
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Update', () => {
        let request, endPoint, app;

        before((done) => {
            endPoint = '/api/rta/u';
            chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    url: 'http://frontend.devsubdomain.com2'
                })
                .then((res) => {
                   app = res.body.payload
                   done()
                });
        });

        beforeEach((done) => {
            request = {
                app_id: app.ap_id,
                id: app.id,
            };
            done()
        });

        it('Should not update an app without app_id', () => {
            return chai.request(server)
                .put(endPoint)
                .send({})
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('This app is invalid!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not update an app with invalid app_id', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    app_id: 'invalid'
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('This is app is either invalid or doesn\'t exists!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should verify an app with app_id', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    app_id: app.app_id,
                    type: 'verify',
                    url: app.url
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.verified.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not verify an app with app_id', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    app_id: app.app_id,
                    url: app.url
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not update an app with invalid app id', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    id: 'invalid'
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('This is app is either invalid or doesn\'t exists!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should update app flag with id', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    id: app.id,
                    flag: false
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.status.should.be.eql(false)
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not update app flag with id', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    id: app.id,
                    flag: ''
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.status.should.be.eql(false)
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    })
});