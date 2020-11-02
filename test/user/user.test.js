const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const commonFunction = require("../commonFunction");
const generatedSampleData = require("../sampleData");
const should = chai.should();
const db = require('../../models');
chai.use(chaiHttp);
const {
    // users,
    salesStages,
    customFields
} = require("../multiple-upload/default-custom-field");
let user, users, user_id, user_id1, createdUserData, email = ['mohammad.z@cisinlabs.com', 'himanshu.shri@cisinlabs.com'], roleId;

describe("User", () => {
    describe("login", () => {
        beforeEach(() => { });

        afterEach(() => {
            let key;
            for (key in this) {
                delete this[key];
            }
        });
        before(done => {
            //Before each test we empty the database
            commonFunction
                .sequalizedDb([
                    "leads_shared_records",
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
                    'supplier_details',
                    'custom_fields',
                    'sections',
                    'leads_clients',
                    'sales_stages',
                    'files_folders_accesses',
                    'user_has_permissions',
                    'user_has_permission_sets',
                    'permission_sets_has_permissions',
                    'permission',
                    'permission_sets',
                    'password_resets',
                    'histories',
                    'notifications',
                    'users',
                    'user_roles'
                ])
                .then(async () => {
                    const role = generatedSampleData.createdSampleData("user_roles", 1);
                    const permission = generatedSampleData.createdSampleData("permission_sets", 1);
                    commonFunction.addDataToTable("user_roles", role[0]).then(role_data => {
                        commonFunction.addDataToTable("permission_sets", permission[0]).then(permission_data => {
                            users = generatedSampleData.createdSampleData('users', 2);
                            users.forEach(element => {
                                element.role_id = roleId = role_data.id;
                                element.permission_set_id = permission_data.id;
                            });
                            users[0].email = 'alex.ripplecrm@gmail.com';
                            users[1].email = 'simon@pswebsitedesign.com';
                            users[0].password = users[1].password = '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa';
                            commonFunction.addBulkDataToTable("users", users).then(data => {
                                user = users[0];
                                createdUserData = data;
                                commonFunction.addBulkDataToTable("sales_stages", salesStages).then(data => {
                                    const sections = generatedSampleData.createdSampleData("sections", 1);
                                    commonFunction.addDataToTable("sections", sections[0]).then(data => {
                                        customFields.forEach(field => { field.section_id = data.id; });
                                        commonFunction.addBulkDataToTable("custom_fields", customFields)
                                            .then(data => {
                                                commonFunction.addBulkDataToTable('files_folders', [{
                                                    original_name: users[0].email,
                                                    created_by: createdUserData[0].id,
                                                    entity_type: 'FOLDER',
                                                    created_at: new Date(),
                                                    updated_at: new Date()
                                                }, {
                                                    original_name: users[1].email,
                                                    created_by: createdUserData[1].id,
                                                    entity_type: 'FOLDER',
                                                    created_at: new Date(),
                                                    updated_at: new Date()
                                                }]).then(data => {
                                                    commonFunction.addBulkDataToTable('files_folders_accesses', [{
                                                        name: 'My Files',
                                                        file_folder_id: data[0].id,
                                                        user_id: createdUserData[0].id,
                                                        permission: 'EDIT',
                                                        entity_type: 'FOLDER',
                                                        parent_id: null,
                                                        refrence_id: null,
                                                        master_name: users[0].email,
                                                        count: 0,
                                                        created_at: new Date(),
                                                        updated_at: new Date()
                                                    }, {
                                                        name: 'My Files',
                                                        file_folder_id: data[1].id,
                                                        user_id: createdUserData[1].id,
                                                        permission: 'EDIT',
                                                        entity_type: 'FOLDER',
                                                        parent_id: null,
                                                        refrence_id: null,
                                                        master_name: users[1].email,
                                                        count: 0,
                                                        created_at: new Date(),
                                                        updated_at: new Date()
                                                    }]).then(data => {
                                                        done();
                                                    })
                                                })
                                            });
                                    });
                                });
                            });
                        });
                    });
                });
        });

        it("it should be login user with token and credential", () => {
            return chai
                .request(server)
                .post("/api/users/login")
                .send({ ...user, ...{ password: '123456' } })
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.token.should.be.a("string");
                    token = res.body.token;
                    loggedInUser = res.body.user;
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe("Post User", () => {
        it("it should not post a user to create a new user without token", () => {
            return chai
                .request(server)
                .post("/api/user/create")
                .field('first_name', 'Zee')
                .field('last_name', 'shan')
                .field('email', email[0])
                .field('roll_access', 1)
                .field('job_title', 'developer')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', [])
                //.attach('profile_image', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then(res => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should post a user to create a new user with token without profile image", () => {
            return chai
                .request(server)
                .post("/api/user/create")
                .set({ Authorization: token })
                .field('first_name', 'Zeeshan')
                .field('last_name', 'A')
                .field('email', email[0])
                .field('roll_access', 1)
                .field('job_title', 'developer')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', [])
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.have.property('message');
                    res.body.should.have.property('user').be.an('object');
                    user_id = res.body.user.id;
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should post a user to create a new user with token with profile image", () => {
            return chai
                .request(server)
                .post("/api/user/create")
                .set({ Authorization: token })
                .field('first_name', 'Himanshu')
                .field('last_name', 'Shri')
                .field('email', email[1])
                .field('roll_access', 1)
                .field('job_title', 'swtch  ar')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', JSON.stringify([{ "custom_field_id": customFields[0].id, "field_value": "asdasd" }]))
              //  .attach('profile_image', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.have.property('message');
                    res.body.should.have.property('user').be.an('object');
                    user_id1 = res.body.user.id;
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    describe("GET User", () => {

        it("it should not get a user without token", () => {
            return chai.request(server)
                .get(`/api/user/${user_id}`)
                .then(res => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should not get a user without token", () => {
            return chai.request(server)
                .get(`/api/user/${user_id}`)
                .set({ Authorization: token })
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('payload').be.an('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should show message for invalid user id", () => {
            return chai.request(server)
                .get(`/api/user/adasdada`)
                .set({ Authorization: token })
                .then(res => {
                    res.should.have.status(422);
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    describe("Edit User", () => {

        it("it should not edit a user without token", () => {
            return chai
                .request(server)
                .put(`/api/user/${user_id}`)
                .field('first_name', 'Zeeshan')
                .field('last_name', 'A - (Edited)')
                .field('email', email[0])
                .field('roll_access', 1)
                .field('job_title', 'swimmer')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', JSON.stringify([]))
              //  .attach('profile_image', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then(res => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should edit a user without token without image", () => {
            return chai
                .request(server)
                .put(`/api/user/${user_id}`)
                .set({ Authorization: token })
                .field('first_name', 'Zeeshan')
                .field('last_name', 'A - (Edited)')
                .field('email', email[0])
                .field('roll_access', 1)
                .field('job_title', 'swimmer')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', JSON.stringify([{ "custom_field_id": customFields[0].id, "field_value": "asdasd" }]))
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('payload');
                    res.body.payload.should.have.property('message');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should update a user's custom field without token without image", () => {
            return chai
                .request(server)
                .put(`/api/user/${user_id}`)
                .set({ Authorization: token })
                .field('first_name', 'Zeeshan')
                .field('last_name', 'A - (Edited)')
                .field('email', email[0])
                .field('roll_access', 1)
                .field('job_title', 'swimmer')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', JSON.stringify([{ "custom_field_id": customFields[0].id, "field_value": "sada" }]))
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('payload');
                    res.body.payload.should.have.property('message');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should not edit a user for wrong id and show message", () => {
            return chai
                .request(server)
                .put(`/api/user/${-1}`)
                .set({ Authorization: token })
                .field('first_name', 'Zeeshan')
                .field('last_name', 'A - (Edited)')
                .field('email', email[0])
                .field('roll_access', 1)
                .field('job_title', 'swimmer')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', JSON.stringify([]))
              //  .attach('profile_image', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then(res => {
                    res.should.have.status(201);
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should show message for invalid user id", () => {
            return chai
                .request(server)
                .put(`/api/user/adasdasd`)
                .set({ Authorization: token })
                .field('first_name', 'Zeeshan')
                .field('last_name', 'A - (Edited)')
                .field('email', email[0])
                .field('roll_access', 1)
                .field('job_title', 'swimmer')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', JSON.stringify([]))
                .then(res => {
                    res.should.have.status(201);
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should not update and show message for already existed email address", () => {
            return chai
                .request(server)
                .put(`/api/user/${user_id}`)
                .set({ Authorization: token })
                .field('first_name', 'Zeeshan')
                .field('last_name', 'A - (Edited)')
                .field('email', email[1])
                .field('roll_access', 1)
                .field('job_title', 'swimmer')
                .field('role_id', roleId)
                .field('is_secure_access', 0)
                .field('user_custom_fields', JSON.stringify([]))
                .then(res => {
                    res.should.have.status(201);
                    res.body.should.have.property('success');
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    describe("Delete User", () => {

        it("it should not delete a user without token", () => {
            return chai
                .request(server)
                .delete(`/api/user/${user_id}`)
                .then(res => {
                    res.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it("it should delete a user and relocate its created data to another user with token", () => {
        //     return chai.request(server)
        //         .delete(`/api/user/${createdUserData[1].id}`)
        //         .set({ Authorization: token })
        //         .send({
        //             action: "toMultiple",
        //             assignTo: [
        //                 { "label": "Leads", "toUser": createdUserData[0].id }, { "label": "Clients", "toUser": createdUserData[0].id },
        //                 { "label": "Events", "toUser": createdUserData[0].id }, { "label": "Media", "toUser": -1 },
        //                 { "label": "Calls", "toUser": createdUserData[0].id }, { "label": "Todos", "toUser": createdUserData[0].id },
        //                 { "label": "Campaigns", "toUser": createdUserData[0].id }
        //             ]
        //         })
        //         .then(res => {
        //             res.should.have.status(200);
        //             res.body.should.have.property('payload');
        //             res.body.should.have.property('success');
        //             res.body.success.should.be.eql(true);
        //         })
        //         .catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        // it("it should delete a user and delete all its data with token", () => {
        //     return chai.request(server)
        //         .delete(`/api/user/${createdUserData[0].id}`)
        //         .set({ Authorization: token })
        //         .send({
        //             action: "toMultiple",
        //             assignTo: [
        //                 { "label": "Leads", "toUser": -1 }, { "label": "Clients", "toUser": -1 },
        //                 { "label": "Events", "toUser": -1 }, { "label": "Media", "toUser": -1 },
        //                 { "label": "Calls", "toUser": -1 }, { "label": "Todos", "toUser": -1 },
        //                 { "label": "Campaigns", "toUser": -1 }
        //             ]
        //         })
        //         .then(res => {
        //             res.should.have.status(200);
        //             res.body.should.have.property('payload');
        //             res.body.should.have.property('success');
        //             res.body.success.should.be.eql(true);
        //         })
        //         .catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });


    });



    after(done => {
        done();
    });
});
