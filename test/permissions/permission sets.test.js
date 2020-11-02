const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, permission_set, permissions;

describe('Testing Permissions Sets', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb([
            'notes', 
            'notifications',
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
            'supplier_details',
            'suppliers',
            'custom_fields', 
            'sections', 
            'leads_clients', 
            'sales_stages', 
            'user_has_permissions',
            'user_has_permission_sets',
            'permission_sets_has_permissions',
            'permission',
            'users',
            'permission_sets',
            'user_roles'
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
                    });
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

    describe('Change permission set for user', () => {

        let request, endPoint;
        beforeEach(() => {
            endPoint = '/api/permissions/sets/changeUserPermissionSet';

            request = {
                permissionSetId: permission_set.id,
                userId: user[0].id
            };
        });

        it('Should return error with no user', () => {
            request.userId = 0;
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Error: Invalid user!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not save the permission set for user with invalid token', () => {
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it('Should save the permission set for user', () => {
        //     request.userId = user[1].id
        //     return chai.request(server)
        //         .put(endPoint)
        //         .send(request)
        //         .set(token)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.status.should.be.eql(true);
        //             res.body.payload.should.be.a('object');
        //             res.body.payload.permission_set.should.be.a('object');
        //             res.body.payload.permission_set.permission_set_id.should.be.eql(permission_set.id);
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        it('Should update the permission set for user', () => {
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('object');
                    res.body.payload.permission_set.should.be.a('object');
                    res.body.payload.permission_set.permission_set_id.should.be.eql(permission_set.id);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not update the permission set with invalid permission set', () => {
            request.permissionSetId = 0;
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Error: No such permission set exists!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Create new permission set', () => {

        let request, endPoint;

        beforeEach(() => {
            endPoint = '/api/permissions/sets/save';
            request = {
                "name": "Test",
                "description": "Test description",
                "permissions": [permissions[0].id],
                "access": {
                    [permissions[0].id]: 'RW'
                }
            }
        })

        it('Should add on valid data', () => {
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.message.should.be.eql('Permission set added successfully!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not add without access token', () => {
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should throw error with no or empty name', () => {

            request.name = '';
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Error: Permission set should have a valid name!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not added without permissions key defined', () => {
            delete request.permissions;
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql("Error: There should be atleast one permission attached to this permission set");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not added with empty permissions', () => {
            delete request.permissions;
            return chai.request(server)
                .post(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql("Error: There should be atleast one permission attached to this permission set");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    })

    describe('Query permission set', () => {

        let request, endPoint;
        beforeEach(() => {
            request = {
                search: permission_set.name
            };

            endPoint = '/api/permissions/sets'
        });

        it('Should not return all the permission sets', () => {
            return chai.request(server)
                .get(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should return all the permission sets', () => {
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

        it('Should return one permission set on search', () => {
            return chai.request(server)
                .get(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                    res.body.payload[0].name.should.be.eql(permission_set.name);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });
    
    describe('Edit permission Set', () => {
        let request, endPoint;

        beforeEach(() => {
            request = {
                "name": "Test",
                "description": "Test description",
                "permissions": [permissions[0].id],
                "access": {
                    [permissions[0].id]: 'RW',
                    [permissions[5].id]: 'R'
                }
            };
            endPoint = `/api/permissions/sets/${permission_set.id}/update`;
        });

        it('Should not update without access token', () => {
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not update name and description when not passed', () => {

            delete request.name;
            delete request.description;

            return chai.request(server)
                .put(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.message.should.be.eql("Permission set updated successfully!");
                    res.body.payload.name.should.be.eql(permission_set.name)
                    res.body.payload.description.should.be.eql(permission_set.description)
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should update with valid data', () => {
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.be.json;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.message.should.be.eql("Permission set updated successfully!");
                    res.body.payload.should.be.a('object');
                    res.body.payload.permission.should.have.lengthOf(1);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it('Should update with permissions with read write access', () => {

        //     request.access = {
        //         [permissions[5].id]: 'RW'
        //     };
        //     request.permissions = [permissions[5].id];
        //     return chai.request(server)
        //         .put(endPoint)
        //         .send(request)
        //         .set(token)
        //         .then((res) => {
        //             res.should.be.json;
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.status.should.be.eql(true);
        //             res.body.message.should.be.eql("Permission set updated successfully!");
        //             res.body.payload.should.be.a('object');
        //             res.body.payload.permission.should.have.lengthOf(1);
        //             res.body.payload.permission[0].access_type.should.be.eql('RW');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        it('Should not update with permission_set_id', () => {
            endPoint = '/api/permissions/sets/0/update';
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql("Error: No such permission set exists!");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should throw error with no permissions', () => {
            request.permissions = '';
            return chai.request(server)
                .put(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql("Error: There should be atleast one permission attached to this permission set!");
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should throw error with no number permission set id', () => {

            endPoint = `/api/permissions/sets/fhgfhgf/update`;

            return chai.request(server)
                .put(endPoint)
                .send(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql("Error: Invalid permission set Id!");
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    describe('Delete permission set', () => {

        let request, endPoint;

        beforeEach(() => {
            request = {
                newId: permission_set.id
            };
            endPoint = `/api/permissions/sets/${permission_set.id}/destroy`;
        });

        it('Should not delete without access token', () => {
            return chai.request(server)
                .delete(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should delete and change with valid data', () => {
            return chai.request(server)
                .delete(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.message.should.be.eql("Permissions delete successfully!");
                    res.should.be.json;
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not delete and throw err with invalid new id', () => {

            request.newId = 'asb';
            return chai.request(server)
                .delete(endPoint)
                .query(request)
                .set(token)
                .then((res) => {
                    res.should.be.json;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql("Error: Permission set which is to be applied on the users, is found to be invalid!");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not delete without permission id', () => {
            endPoint = '/api/permissions/sets/0/destroy';
            return chai.request(server)
                .delete(endPoint)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql("Error: No such permission set exists!");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

});
