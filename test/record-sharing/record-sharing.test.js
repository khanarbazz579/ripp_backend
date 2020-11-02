const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const commonFunction = require("../commonFunction");
const generatedSampleData = require("../sampleData");
const should = chai.should();
const db = require("../../models");
chai.use(chaiHttp);
const {
    // users,
    salesStages,
    customFields
} = require("../multiple-upload/default-custom-field");

let _leads, leadArray, user, token, loggedInUser, record, users;

describe("Leads", () => {
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
                    'custom_fields',
                    'sections',
                    'leads_clients',
                    'sales_stages',
                    'user_has_permissions',
                    'user_has_permission_sets',
                    'permission_sets_has_permissions',
                    'permission',
                    'permission_sets',
                    'users',
                    "user_roles"
                ])
                .then(() => {
                    const role = generatedSampleData.createdSampleData("user_roles", 1);
                    const permission = generatedSampleData.createdSampleData(
                        "permission_sets",
                        1
                    );
                    commonFunction
                        .addDataToTable("user_roles", role[0])
                        .then(role_data => {
                            commonFunction.addDataToTable("permission_sets", permission[0]).then(permission_data => {
                                users = generatedSampleData.createdSampleData('users', 2);
                                users.forEach(element => {
                                    element.role_id = role_data.id;
                                    element.permission_set_id = permission_data.id;
                                });
                                users[0].email = 'alex.ripplecrm@gmail.com';
                                users[1].email = 'simon@pswebsitedesign.com';
                                users[0].password = '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa'
                                users[1].password = '$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa'
                                commonFunction.addBulkDataToTable("users", users).then(data => {
                                    user = users[0];
                                    // user.password = "123456";
                                    commonFunction
                                        .addBulkDataToTable("sales_stages", salesStages)
                                        .then(data => {
                                            const sections = generatedSampleData.createdSampleData(
                                                "sections",
                                                1
                                            );
                                            commonFunction
                                                .addDataToTable("sections", sections[0])
                                                .then(data => {
                                                    customFields.forEach(field => {
                                                        field.section_id = data.id;
                                                    });
                                                    commonFunction
                                                        .addBulkDataToTable(
                                                            "custom_fields",
                                                            customFields
                                                        )
                                                        .then(data => {
                                                            done();
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
                // .send(user)
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

    describe("/POST leads", () => {
        before(done => {
            //Before each test we empty the database
            const leadArray = generatedSampleData.createdSampleData(
                "leads_clients",
                1
            );
            leadData = leadArray[0];
            done();
        });

        it("it should POST a lead", () => {
            return chai
                .request(server)
                .post("/api/lead")
                .set({
                    Authorization: token
                })
                .send(leadData)
                .then(res => {
                    res.should.have.status(201);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a("object");
                    const lead = res.body.lead;
                    leadId = lead.id;
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });



    describe("/POST Lead Shared Record", () => {
        let dataObj = {};
        before(done => {
            dataObj.create = [
                {
                    lead_id: leadId,
                    access_type: "RWX",
                    user_id: loggedInUser.id
                }
            ];
            done();
        });

        /*------------------------------------
                || Update Leads ||
        -------------------------------------*/

        describe('Update Leads', () => {
            it("Should Update Leads Without Action ", () => {
                return chai
                    .request(server)
                    .post("/api/lead/sharing/update")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(200);
                        const body = res.body;
                        body.status.should.be.eql(true);
                        body.should.have.property("payload");
                        body.payload.should.have.property("created").be.a("array");
                        if (typeof body.payload.created[0] === "object")
                            record = body.payload.created[0];
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            it("Should Update Shared Record History With Delete All Action", () => {
                dataObj.update = [
                    {
                        access_type: "R",
                        do: {
                            action: "delete-all",
                            eventUser: null,
                            callUser: null,
                            todoUser: null,
                            allToUser: null
                        },
                        id: 3,
                        lead_id: 1,
                        user_id: 4
                    }
                ];
                dataObj.destroy = [record.id];

                return chai
                    .request(server)
                    .post("/api/lead/sharing/update")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(200);
                        const body = res.body;
                        body.status.should.be.eql(true);
                        body.should.have.property("payload");
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });

        })




        /*------------------------------------
                || Get User Search ||
        -------------------------------------*/

        describe("/Get User Search with type", () => {
            it("should search user with type", () => {
                return chai
                    .request(server)
                    .get("/api/lead/sharing/stream/users?type=users&search=ale&exclude=0")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(200);
                        const body = res.body;
                        body.should.have.property('status');
                        body.status.should.be.eql(true);
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            it("should search user with type", () => {
                return chai
                    .request(server)
                    .get("/api/lead/sharing/stream/user?type=users&search=ale&exclude=0")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(422);
                        const body = res.body;
                        body.should.have.property('status');
                        body.status.should.be.eql(false);
                        body.should.have.property('message');
                        body.message.should.be.eql('Invalid request!');
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });
        });

        /*------------------------------------
                || Update Shared History ||
        -------------------------------------*/

        describe("/Update Shared History", () => {
            it("Should Update Shared History with relocate to one", () => {
                dataObj.update = [
                    {
                        access_type: "R",
                        do: {
                            action: "relocate-to-one",
                            eventUser: -1,
                            callUser: -1,
                            todoUser: -1,
                            allToUser: null
                        },
                        id: 3,
                        lead_id: 1,
                        user_id: 1
                    }
                ];

                return chai
                    .request(server)
                    .post("/api/lead/sharing/update")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(200);
                        const body = res.body;
                        body.should.have.property('status');
                        body.status.should.be.eql(true);
                        body.should.have.property('message');
                        body.should.have.property("payload");
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            it("Should Update Shared Hitory with relocate to one action", () => {
                dataObj.update = [
                    {
                        access_type: "R",
                        do: {
                            action: "relocate-to-one",
                            eventUser: 0,
                            callUser: 0,
                            todoUser: 0,
                            allToUser: null
                        },
                        id: 3,
                        lead_id: 1,
                        user_id: 1
                    }
                ];

                return chai
                    .request(server)
                    .post("/api/lead/sharing/update")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(200);
                        const body = res.body;
                        body.should.have.property('status');
                        body.status.should.be.eql(true);
                        body.should.have.property('message');
                        body.should.have.property("payload");
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            it("Should Update Shared Hitory", () => {
                dataObj.update = [
                    {
                        access_type: "R",
                        do: {
                            action: "relocate-to-multiple",
                            eventUser: -1,
                            callUser: -1,
                            todoUser: -1,
                            allToUser: null
                        },
                        id: 3,
                        lead_id: 1,
                        user_id: 1
                    }
                ];

                return chai
                    .request(server)
                    .post("/api/lead/sharing/update")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(200);
                        const body = res.body;
                        body.should.have.property('status');
                        body.should.have.property('payload');
                        body.should.have.property('message');
                        body.status.should.be.eql(true);
                        body.should.have.property("payload");
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });
        });

        /*------------------------------------
                || Update Owner ||
        -------------------------------------*/

        describe("/Update Owner", () => {
            it("Should Update Owner", () => {
                dataObj = {
                    ownerId: 4,
                    selectedOpts: 2,
                    update: [
                        {
                            access_type: "R",
                            do: {
                                action: "",
                                eventUser: 0,
                                callUser: 0,
                                todoUser: 0,
                                allToUser: null
                            },
                            id: 3,
                            lead_id: 1,
                            user_id: 1
                        }
                    ]
                };
                return chai
                    .request(server)
                    .post("/api/lead/sharing/updateOwner")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(200);
                        const body = res.body;
                        body.should.have.property('status');
                        body.should.have.property('message');
                        body.status.should.be.eql(true);
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            it("Should Update Owner", () => {
                dataObj = {
                    ownerId: 4,
                    selectedOpts: 2,
                    update: [
                        {
                            access_type: "R",
                            do: {
                                action: "",
                                eventUser: 0,
                                callUser: 0,
                                todoUser: 0,
                                allToUser: null
                            },
                            id: 3,
                            lead_id: 1,
                            user_id: 2
                        }
                    ]
                };

                return chai
                    .request(server)
                    .post("/api/lead/sharing/updateOwner")
                    .set({
                        Authorization: token
                    })
                    .send(dataObj)
                    .then(res => {
                        res.should.have.status(200);
                        const body = res.body;
                        body.should.be.a("object");
                        body.status.should.be.eql(true);
                        body.message.should.be.eql("Updated Successfully.");
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });
        });

        /*------------------------------------
            || Get Shared Users Count ||
        -------------------------------------*/

        describe("/Get Shared User Count", () => {
            it("Should Get to Shared User Count with lead id", () => {
                return chai
                    .request(server)
                    .get(`/api/lead/sharing/getSharedUsersCount/${leadId}`)
                    .set({
                        Authorization: token
                    })
                    .then(res => {
                        const body = res.body;
                        body.should.have.property('count');
                        body.should.have.property('users');
                        body.should.have.property('loggedInUser');
                        res.should.have.status(200);
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            it("Should Get to Shared User Count with wrong lead id", () => {
                return chai
                    .request(server)
                    .get(`/api/lead/sharing/getSharedUsersCount/${'u'}`)
                    .set({
                        Authorization: token
                    })
                    .then(res => {
                        const body = res.body;
                        body.should.be.a("object");
                        body.should.have.property('success');
                        res.should.have.status(422);
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });
        });

        /*------------------------------------
            || Get Shared Users By Lead Id ||
            -------------------------------------*/

        describe("/Get Shared Users By Lead Id", () => {
            it("Should Get to shared users by lead id", () => {
                return chai
                    .request(server)
                    .get(`/api/lead/sharing/getSharedUsersByLeadId/${leadId}`)
                    .set({
                        Authorization: token
                    })
                    .then(res => {
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.status.should.be.eql(true);
                        res.body.payload.should.be.a("array");
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            it("Should Get to shared users by lead id with wrong id", () => {
                return chai
                    .request(server)
                    .get(`/api/lead/sharing/getSharedUsersByLeadId/u`)
                    .set({
                        Authorization: token
                    })
                    .then(res => {
                        res.should.have.status(422);
                        res.body.should.have.property('status');
                        res.body.status.should.be.eql(false);
                        res.body.should.have.property('message');
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            });
        });
    });

    after(done => {
        done();
    });
});