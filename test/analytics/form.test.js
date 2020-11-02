const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, permission_set, permissions, contact, form, salesStageBody;

describe('Website tracking apps:: Form builder', () => {
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
                            .then((data) => {
                                form = data;
                                done()
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

    describe('Create', () => {

        let request, endPoint;

        beforeEach((done) => {
            request = {
                form_name: 'Test form',
                type: 'NEW',
                user_type:'lead',
                sales_stage_id: salesStageBody.id,
                owner_mappings: [{
                    id: user[0].id,
                    type: 'OWNER'
                }]
            };
            endPoint = '/api/rta/form';
            done()
        });

        it('Should not create a form without token', () => {
            return chai.request(server)
                .post(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create a form without form name', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({})
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Please specify form name!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create a form without form type', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    form_name: request.form_name
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Please specify whether form is existing or new!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create a form without form user mappings', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    form_name: request.form_name,
                    type: request.type
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Please specify user mappings!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create a form without form user mappings', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    form_name: request.form_name,
                    type: request.type,
                    user_type: request.user_type,
                    sales_stage_id: request.sales_stage_id
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Please add map a record owner to the new added users!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not create a form without form user mappings 2', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    form_name: request.form_name,
                    type: request.type,
                    user_type: request.user_type,
                    sales_stage_id: request.sales_stage_id,
                    owner_mappings: []
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Please add map a record owner to the new added users!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should create a form', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send(request)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.form_name.should.be.eql(request.form_name);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Get', function() {

        let request, endPoint;

        beforeEach((done) => {
            request = {
                sort: {
                    field: 'user_id',
                    order: 'DESC'
                }
            };
            endPoint = '/api/rta/form/all';
            done()
        });

        it('Should not get any forms without token', () => {
            return chai.request(server)
                .get(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get all forms', () => {
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.rows.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get all forms with sorting', () => {
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.rows.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get all forms with sorting 2', () => {

            request.sort.field = 'form_name';
            request.paginate = {
                limit: 5,
                offset: 0
            }
            return chai.request(server)
                .get(endPoint)
                .query({
                    data: JSON.stringify(request)
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.rows.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get a single form', () => {
            return chai.request(server)
                .get(endPoint)
                .query({
                   id: form.id
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.id.should.be.eql(form.id)
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe('Update', () => {

        let request, endPoint;

        beforeEach((done) => {
            request = {
                sort: {
                    field: 'user_id',
                    order: 'DESC'
                }
            };
            endPoint = '/api/rta/form/' + form.id;
            done()
        });

        it('Should not get any forms without token', () => {
            return chai.request(server)
                .put(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get any forms with invalid form id', () => {
            return chai.request(server)
                .put('/api/rta/form/123')
                .set(token)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('No such form exists!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get data without any update', () => {
            return chai.request(server)
                .put(endPoint)
                .set(token)
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

        it('Should update data', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    status: true,
                    verified: true,
                    fields_mapped: true,
                    form_name: 'test',
                    type: 'EXISTING',
                    sales_stage_id: '2',
                    user_type: 'client',
                    field_mapping_buffer: {
                        email: 'email@email.com',
                        phone: 123456789,
                        name: 'test'
                    }
                })
                .set(token)
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

        it('Should create field mappings', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    field_mappings:[{
                        input_name: 'email',
                        order: 1,
                        column: 1,
                        custom_field_id: 1,
                        field_attributes: {}
                    }, {
                        input_name: 'phone',
                        order: 2,
                        column: 1,
                        custom_field_id: 2,
                        field_attributes: {}
                    }]
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.id.should.be.eql(form.id);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        })

        it('Should update field mappings', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    field_mappings:[{
                        input_name: 'email',
                        order: 1,
                        column: 2,
                        field_attributes: {}
                    }, {
                        input_name: 'phone',
                        order: 1,
                        column: 1,
                        custom_field_id: 2,
                    }]
                })
                .set(token)
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

        it('Should create owner mappings', () => {
            return chai.request(server)
                .put(endPoint)
                .send({
                    owner_mappings:[{
                        id: user[0].id,
                        access: 'RX',
                        type: 'SHARED_WITH'
                    }, {
                        id: user[1].id,
                        type: 'OWNER'
                    }]
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.id.should.be.eql(form.id);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe('Users typeahead', () => {

        let request, endPoint;

        beforeEach((done) => {
            request = {
                permissions: {
                    type: 'LEAD'
                }
            };
            endPoint = '/api/rta/form/o/user';
            done()
        });

        it('Should not get any users without token', () => {
            return chai.request(server)
                .get(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users', () => {
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users with leads permissions', () => {
            return chai.request(server)
                .get(endPoint)
                .query({
                    data: JSON.stringify(request)
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users with client permissions', () => {
            request.permissions.type = 'client';
            return chai.request(server)
                .get(endPoint)
                .query({
                    data: JSON.stringify(request)
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users with both permissions', () => {
            request.permissions.type = 'both';
            return chai.request(server)
                .get(endPoint)
                .query({
                    data: JSON.stringify(request)
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users with supplier permissions', () => {
            request.permissions.type = 'supplier';
            return chai.request(server)
                .get(endPoint)
                .query({
                    data: JSON.stringify(request)
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users without selected users', () => {
            request.selected = [user[1].id];
            return chai.request(server)
                .get(endPoint)
                .query({
                    data: JSON.stringify(request)
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users within selected users', () => {
            request.where = {
                id: [user[1].id, user[0].id]
            };

            return chai.request(server)
                .get(endPoint)
                .query({
                    data: JSON.stringify(request)
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users within searched users', () => {
            request.search = 'a';

            return chai.request(server)
                .get(endPoint)
                .query({
                    data: JSON.stringify(request)
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get init data', () => {

            return chai.request(server)
                .get('/api/rta/form/o/init')
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.salesStages.should.be.a('array');
                    res.body.payload.fields.should.be.a('array');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Delete the Form', () => {

        let request, endPoint;

        beforeEach((done) => {
            request = {
                permissions: {
                    type: 'LEAD'
                }
            };
            endPoint = '/api/rta/form/' + form.id;
            done()
        });

        it('Should not delete without token', () => {
            return chai.request(server)
                .delete(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not delete with invalid identifier', () => {
            endPoint = '/api/rta/form/as';
            return chai.request(server)
                .delete(endPoint)
                .set(token)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Please send a valid form identifier!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should delete with valid identifier', () => {
            return chai.request(server)
                .delete(endPoint)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.message.should.be.eql('Form deleted successfully!');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });
});