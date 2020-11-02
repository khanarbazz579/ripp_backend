const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, permission_set, permissions;

describe('Testing Permissions Management', () => {
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
            "user_roles"
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

    describe('User list with permissions', () => {

        let request, endPoint;

        beforeEach(() => {

            request = {
                permission_id: 1,
                permission_have_access: 1
            }

            endPoint = '/api/permissions/users';
        })

        it('Should not access users with permissions without token', () => {
            return chai.request(server)
                .get(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get list of users without any filters', () => {
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get list of users with permissions filter when permission is not applied on any user ', () => {
            request.permission_id = permissions[0].id;
            request.permission_have_access = 1;
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                    res.body.payload.should.have.lengthOf(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get list of users with permissions having access', () => {

            commonFunction.addDataToTable('user_has_permissions', {
                user_id: user[1].id,
                permission_id: permissions[0].id
            })
                .then(() => {
                    request.permission_id = permissions[0].id;
                    request.permission_have_access = '1';
                    return chai.request(server)
                        .get(endPoint)
                        .query(request)
                        .set(token)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.status.should.be.eql(true);
                            res.body.payload.should.be.a('array');
                            res.body.payload.should.have.length.greaterThan(0);
                            res.body.payload[0].id.should.be.eql(user[1].id)
                        }).catch(function (err) {
                            return Promise.reject(err);
                        });
                })
        });

        it('Should get list of users with permissions not having access', () => {

            commonFunction.addDataToTable('user_has_permissions', {
                user_id: user[0].id,
                permission_id: permissions[0].id
            })
                .then(() => {
                    request.permission_id = permissions[0].id;
                    request.permission_have_access = '0';
                    return chai.request(server)
                        .get(endPoint)
                        .query(request)
                        .set(token)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.status.should.be.eql(true);
                            res.body.payload.should.be.a('array');
                            for (let i = 0; i < res.body.payload.length; i++) {
                                res.body.payload[i].id.should.not.be.eql(user[0].id);
                            }
                        }).catch(function (err) {
                            return Promise.reject(err);
                        });
                })
        });

        it('Should not get list of users with permission sets filter when permission set is not applied on any user', () => {

            request = {
                permission_set_id: 1999,
                permission_set_have_access: 1
            };

            return chai.request(server)
                .get(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                    res.body.payload.should.have.lengthOf(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get list of users with permissions set having access', () => {

            commonFunction.addDataToTable('user_has_permission_sets', {
                user_id: user[1].id,
                permission_set_id: permission_set.id
            })
                .then(() => {

                    request = {
                        permission_set_id: permission_set.id,
                        permission_set_have_access: 1
                    };
                    return chai.request(server)
                        .get(endPoint)
                        .query(request)
                        .set(token)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.status.should.be.eql(true);
                            res.body.payload.should.be.a('array');
                            res.body.payload.should.have.length.greaterThan(0);
                            res.body.payload[0].id.should.be.eql(user[1].id)
                        }).catch(function (err) {
                            return Promise.reject(err);
                        });
                })
        });

        it('Should get list of users with permissions set not having access', () => {

            commonFunction.addDataToTable('user_has_permission_sets', {
                user_id: user[1].id,
                permission_set_id: permission_set.id
            })
                .then(() => {

                    request = {
                        permission_set_id: permission_set.id,
                        permission_set_have_access: 0
                    };
                    return chai.request(server)
                        .get(endPoint)
                        .query(request)
                        .set(token)
                        .then((res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.status.should.be.eql(true);
                            res.body.payload.should.be.a('array');

                            for (let i = 0; i < res.body.payload.length; i++) {
                                res.body.payload[i].id.should.not.be.eql(user[0].id);
                            }
                        }).catch(function (err) {
                            return Promise.reject(err);
                        });
                });
        });

        // it('Should get list of users with search filter ', () => {
        //     return chai.request(server)
        //         .get(endPoint)
        //         .query({
        //             search: user[1].first_name
        //         })
        //         .set(token)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.status.should.be.eql(true);
        //             res.body.payload.should.be.a('array');
        //             res.body.payload.should.have.lengthOf(1);
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        it('Should not get list of users with search filter using no existing names ', () => {
            return chai.request(server)
                .get(endPoint)
                .query({
                    search: 'non-existing'
                })
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                    res.body.payload.should.have.lengthOf(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it('Should return the user with permission set', () => {
        //     return chai.request(server)
        //         .get(endPoint)
        //         .query({
        //             search: user[1].first_name
        //         })
        //         .set(token)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.status.should.be.eql(true);
        //             res.body.payload.should.be.a('array');
        //             res.body.payload[0].permission_set.should.be.a('object');
        //             res.body.payload[0].permission_set.permission_set_id.should.be.eql(permission_set.id);
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
    });

    describe('List of all permissions', () => {

        let request, endPoint;

        beforeEach(() => {

            request = {
                type: 'stream'
            };

            endPoint = '/api/permissions/stream/permissions';
        })

        it('Should not return all the permissions', () => {
            return chai.request(server)
                .get(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should return all the permissions in plain DS', () => {
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should return all the permissions in plain nested DS', () => {

            request.type = 'nested';
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should return all the permissions in tree DS', () => {
            request.type = 'tree';
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('List of all permissions on a user', () => {

        let request, endPoint;

        beforeEach(() => {

            request = {};

            endPoint = '/api/permissions/individual/' + user[0].id;
        });

        it('Should not return all the user permissions', () => {
            return chai.request(server)
                .get(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not return all the user permissions without valid userId', () => {
            delete request.userId;
            return chai.request(server)
                .get('/api/permissions/individual/dsf')
                .set(token)
                .then((res) => {
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Error: Cannot perform requested operation, invalid user!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should return all the user permissions', () => {
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.access.should.be.a('object');
                    res.body.payload.permissions.should.be.a('array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Save permissions for a user', () => {

        let request, endPoint;

        beforeEach(() => {

            request = {
                data: {
                    permissions: [permissions[0].id, permissions[5].id],
                    access: {
                        [permissions[0].id]: 'RW',
                        [permissions[5].id]: 'R'
                    }
                },
                userId: user[0].id
            };

            endPoint = '/api/permissions/individual/save';
        });

        it('Should not update individual user permission without token', () => {
            return chai.request(server)
                .post(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not update individual user permission without valid userId', () => {
            delete request.userId;
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Error: Cannot perform requested operation, invalid user!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it('Should update individual user permission', () => {
        //     return chai.request(server)
        //         .post(endPoint)
        //         .send(request)
        //         .set(token)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.status.should.be.eql(true);
        //             res.body.payload.should.be.a('object');
        //             res.body.payload.permissions.should.be.a('array');
        //             res.body.payload.permissions.should.have.lengthOf(2);
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        it('Should not update individual user permission when access key is not present!', () => {

            request = {
                data: {
                    permissions: [permissions[0].id, permissions[5].id],
                    access: {
                        [permissions[0].id]: 'RW'
                    }
                },
                userId: user[0].id
            }

            return chai.request(server)
                .post(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Error: Invalid permissions configurations, please try again!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    })
});