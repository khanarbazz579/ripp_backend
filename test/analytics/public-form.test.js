const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, permission_set, permissions, contact, form, salesStageBody, eForm;

describe('Website tracking apps:: Form builder public APIs', () => {
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
            "analytic_app_users",
            'forms',
            'form_owner_mappings',
            'form_field_mappings',
            'form_submissions',
            'form_submission_values'
        ]).then(async () => {
            role = generatedSampleData.createdSampleData("user_roles", 1);
            permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 2);
            user[0].email = 'ripple.cis2018@gmail.com';
            permissions = [
                { permission: 'leads custom fields'},
                { permission: 'add new leads'},
                { permission: 'edit leads'},
                { permission: 'add new clients'},
                { permission: 'add new suppliers'},
                { permission: 'edit suppliers'},
                { permission: 'add new leads'},
                { permission: 'edit leads'},
                { permission: 'add new clients'},
                { permission: 'edit clients' }
            ]

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

                            commonFunction.addDataToTable("forms", {
                                user_id: userBody.id,
                                form_id: '123456',
                                form_name: 'Test form',
                                created_at: new Date(),
                                updated_at: new Date(),
                                status: 1,
                                type: 'NEW',
                                user_type:'lead',
                                sales_stage_id: salesStageBody.id 
                            })
                            .then(async (data) => {
                                form = data;

                                await commonFunction.addDataToTable('form_field_mappings', {
                                    form_id: data.id,
                                    input_name: 'email',
                                    column: 1,
                                    order: 1,
                                    custom_field_id: 1
                                });

                                await commonFunction.addDataToTable('form_field_mappings', {
                                    form_id: data.id,
                                    input_name: 'phone',
                                    column: 2,
                                    order: 1,
                                    custom_field_id: 2
                                });

                                eForm = await commonFunction.addDataToTable("forms", {
                                    user_id: userBody.id,
                                    form_id: '123456',
                                    form_name: 'Test form',
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    status: 1,
                                    type: 'EXISTING',
                                    user_type:'lead',
                                    sales_stage_id: salesStageBody.id 
                                });

                                await commonFunction.addDataToTable('form_field_mappings', {
                                    form_id: eForm.id,
                                    input_name: 'email',
                                    column: 1,
                                    order: 1,
                                    custom_field_id: 1
                                });

                                await commonFunction.addDataToTable('form_field_mappings', {
                                    form_id: eForm.id,
                                    input_name: 'phone',
                                    column: 2,
                                    order: 1,
                                    custom_field_id: 2
                                });

                                done();
                            });

                            leads = generatedSampleData.createdSampleData("leads_clients", 1);
                            leads[0].sales_stage_id = salesStageBody.id;
                            leads[0].user_id = userBody.id;
                        });

                        commonFunction.addDataToTable('user_has_permission_sets', {
                            user_id: user[0].id,
                            permission_set_id: permission_data.id
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

    describe('Get Form', () => {

        let request, endPoint;

        beforeEach((done) => {
            request = {
                id: form.form_id
            };
            endPoint = '/api/rta/form/p';
            done()
        });

        it('Should not get form without form id', () => {
            return chai.request(server)
                .get(endPoint)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Invalid request!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get form with non existent form id', () => {
            return chai.request(server)
                .get(endPoint)
                .query({
                    id: '1a2s3d42as1d2'
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Either form doesn\'t exists or is invalid!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get form with id ', () => {
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.form_id.should.be.eql(form.form_id);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get form with id for existing form', () => {
            return chai.request(server)
                .get(endPoint)
                .query({
                    id: eForm.form_id
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.form_id.should.be.eql(form.form_id);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    describe('Update mappings', () => {
        let request, endPoint;

        beforeEach((done) => {
            request = {
                email: user[0].email,
                phone: '123459789',
                message: 'send'
            }
            endPoint = '/api/rta/form/p/'+form.id;
            done()
        });

        it('Should not update a form with invalid form id', () => {
            return chai.request(server)
                .put('/api/rta/form/p/'+form.form_id)
                .send(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('No such form exists!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should update a form with form id', () => {
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.id.should.be.eql(form.id);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Save submissions', () => {
        let request, endPoint;

        beforeEach((done) => {
            request = {
                fields: {
                    email: user[0].email,
                    phone: '123459789',
                    message: 'send',
                },
                form_id: form.id
            }
            endPoint = '/api/rta/form/p/save';
            done()
        });

        it('Should not save the submission with no form id', () => {
            return chai.request(server)
                .post(endPoint)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Invalid form!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not save the submission with no form id', () => {
            request.form_id = '21323'
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Form is disabled, please contact administrator!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

         it('Should save the submission with form id', () => {
            request.form_id = form.id
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    console.log("res.body", res.body);
                    res.body.payload.should.be.a('object');
                    res.body.payload.form_id.should.be.eql(form.id);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });
});