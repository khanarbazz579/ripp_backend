const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, permission_set, permissions, adminRoleId, roleId;

describe('Testing Role Access', () => {
    let endPoint;
    beforeEach(() => {
        endPoint = '/api/role-access';
    });

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
            "user_roles"
        ]).then(async() => {
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
            .catch(function(err) {
                return Promise.reject(err);
            });
    });

    describe('Role Access creation', () => {
        beforeEach(() => {
            endPoint = '/api/role-access';
        });

        it('Should not post a role access without token', () => {
            return chai.request(server)
                .post(endPoint)
                .send({
                    name: 'Executive',
                    parent_id: adminRoleId
                })
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        it('Should Post a role access with token', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    name: 'Executive',
                    parent_id: adminRoleId
                })
                .then((res) => {
                    res.should.have.status(200);
                    const { body: { status, payload, message } } = res;
                    status.should.be.a('boolean').eql(true);
                    payload.should.be.a('Array');
                    const { id } = payload[0].childrens[0];
                    roleId = id;
                    message.should.be.a('string');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should Post a role access with no parent', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    name: 'Another super Admin'
                })
                .then((res) => {
                    res.should.have.status(200);
                    const { body: { status, payload, message } } = res;
                    status.should.be.a('boolean').eql(true);
                    payload.should.be.a('Array');
                    const { id } = payload[0].childrens[0];
                    roleId = id;
                    message.should.be.a('string');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should throw error for existed same name role access', () => {
            return chai.request(server)
                .post(endPoint)
                .set(token)
                .send({
                    name: 'Executive',
                    parent_id: adminRoleId
                })
                .then((res) => {
                    res.should.have.status(422);
                    const { body: { status, payload, message } } = res;
                    status.should.be.a('boolean').eql(false);
                    message.should.be.a('string');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

    })

    describe('Updating role access', () => {
        beforeEach(() => {
            endPoint = '/api/role-access';
        });

        it('Should not update the role parent without token', () => {
            return chai.request(server)
                .put(endPoint + '/updateParent')
                .send([{
                    id: roleId,
                    parent_id: adminRoleId
                }])
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should update the role parent with token', () => {
            return chai.request(server)
                .put(endPoint + '/updateParent')
                .set(token)
                .send({
                    data: [{
                        id: roleId,
                        parent_id: adminRoleId
                    }]
                })
                .then((res) => {
                    res.should.have.status(200);
                    const { body: { status, message } } = res;
                    status.should.be.a('boolean').eql(true);
                    message.should.be.a('string');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should not update, but show invalid request message if data not passed properly', () => {
            return chai.request(server)
                .put(endPoint + '/updateParent')
                .set(token)
                .send({})
                .then((res) => {
                    res.should.have.status(422);
                    const { body: { status, message } } = res;
                    status.should.be.a('boolean').eql(false);
                    message.should.be.a('string');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should update role access', () => {
            
            return chai.request(server)
                .put(endPoint + '/'+roleId+'/update')
                .set(token)
                .send({
                    id: roleId,
                    parent_id: adminRoleId,
                    name: 'new Name'
                })
                .then((res) => {
                    res.should.have.status(200);
                    const { body: { status, message } } = res;
                    status.should.be.a('boolean').eql(true);
                    message.should.be.a('string');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        })

        it('Should throw error if no name is supplied', () => {
            
            return chai.request(server)
                .put(endPoint + '/'+roleId+'/update')
                .set(token)
                .send({
                    id: roleId,
                    parent_id: adminRoleId
                })
                .then((res) => {
                    res.should.have.status(422);
                    const { body: { status, message } } = res;
                    status.should.be.a('boolean').eql(false);
                    message.should.be.a('string');
                    message.should.be.eql('Error: Please enter a name for role!');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        })

        it('Should throw error if no name is matches with some other role', () => {
            
            return chai.request(server)
                .put(endPoint + '/'+roleId+'/update')
                .set(token)
                .send({
                    id: roleId,
                    parent_id: adminRoleId,
                    name: 'Executive'
                })
                .then((res) => {
                    res.should.have.status(422);
                    const { body: { status, message } } = res;
                    status.should.be.a('boolean').eql(false);
                    message.should.be.a('string');
                    message.should.be.eql('Error: A role with this name already exists!');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        })

        it('Should reassign user new role', () => {
            
            return chai.request(server)
                .put(endPoint + '/'+roleId+'/update')
                .set(token)
                .send({
                    id: roleId,
                    parent_id: adminRoleId,
                    name: 'new Role',
                    reassign: [{
                        id: user[0].id,
                        role_id: roleId
                    }]
                })
                .then((res) => {
                    res.should.have.status(200);
                    const { body: { status, message } } = res;
                    status.should.be.a('boolean').eql(true);
                    message.should.be.a('string');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        })
    })

    describe('Listing role access', () => {
        beforeEach(() => {
            endPoint = '/api/role-access';
        });

        it('Should return role access', () => {
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .then((res) => {
                    res.body.status.should.be.a('boolean').eql(true);
                    res.body.payload.should.be.a('Array');
                    const { id } = res.body.payload[0];
                    adminRoleId = id;
                    res.body.message.should.be.a('string');
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should return role access with user ', () => {
            return chai.request(server)
                .get(endPoint+'?includeUsers=1')
                .set(token)
                .then((res) => {
                    res.body.status.should.be.a('boolean').eql(true);
                    res.body.payload.should.be.a('Array');
                    const { id } = res.body.payload[0];
                    adminRoleId = id;
                    res.body.message.should.be.a('string');
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should return role access with user search ', () => {
            return chai.request(server)
                .get(endPoint+'?includeUsers=1&search='+user[0].first_name)
                .set(token)
                .then((res) => {
                    res.body.status.should.be.a('boolean').eql(true);
                    res.body.payload.should.be.a('Array');
                    const { id } = res.body.payload[0];
                    adminRoleId = id;
                    res.body.message.should.be.a('string');
                    res.should.have.status(200);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        it('Should not get role by its id without token', () => {
            return chai.request(server)
                .get(endPoint + '/getUserByRoleId/' + roleId)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should get role by its id with token', () => {
            return chai.request(server)
                .get(endPoint + '/getUserByRoleId/' + roleId)
                .set(token)
                .then((res) => {
                    res.should.have.status(200);
                    const { body: { status, message } } = res;
                    status.should.be.a('boolean').eql(true);
                    message.should.be.a('string');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should throw error with invalid role id', () => {
            return chai.request(server)
                .get(endPoint + '/getUserByRoleId/string')
                .set(token)
                .then((res) => {
                    res.should.have.status(422);
                    const { body: { status, message } } = res;
                    status.should.be.a('boolean').eql(false);
                    message.should.be.a('string');
                    message.should.be.eql('Error: Invalid role id!')
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Delete role access', () => {
        beforeEach(() => {
            endPoint = '/api/role-access';
        });

        it('Should not delete role access without access token', () => {
            return chai.request(server)
                .delete(endPoint+'/'+roleId)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        // it('Should delete role access with token', () => {
        //     return chai.request(server)
        //         .delete(endPoint+'/'+roleId)
        //         .set(token)
        //         .then((res) => {
        //             console.log("TCL: res.body", res.header)
        //             res.should.have.status(200);
        //             res.body.status.should.be.a('boolean').eql(true);
        //             res.body.message.should.be.a('string').eql('Role deleted successfully!');
        //         }).catch(function(err) {
        //             return Promise.reject(err);
        //         });
        // });
    })

    describe('Get use role access token', () => {
        let header = {};

        beforeEach(() => {
            endPoint = '/api/role-access/tokens';
            header = {
                users: [],
                roles: []
            }
        });

        it('Should not get user tokens without access token', () => {
            return chai.request(server)
                .delete(endPoint)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should get user tokens with token', () => {
            header.users = [loggedInUser.id]
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .set('X-Role-Access', Buffer.from(JSON.stringify(header)).toString('base64'))
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.a('boolean');
                    res.body.payload.should.be.a('array');
                    res.body.payload.should.not.be.empty;
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('Should get user 0 tokens with token', () => {
            return chai.request(server)
                .get(endPoint)
                .set(token)
                .set('X-Role-Access', Buffer.from(JSON.stringify(header)).toString('base64'))
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.a('boolean');
                    res.body.payload.should.be.a('array');
                    res.body.payload.should.be.empty;
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });
    
});