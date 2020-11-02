const chai = require("chai");
const chaiHttp = require("chai-http");
const commonFunction = require("../commonFunction");
const server = require("../../app");
const generatedSampleData = require("../sampleData");
const should = chai.should();
const models = require('../../models');
const jwt = require('jsonwebtoken');


let token, user, email_lists, contacts, contactsData, email_list_id = [], createdList = [], contactIdToSend = [], contactId, subscriberList = [], subscriberIdToSend = [], customFieldBody, customField, mainBody, customFieldId, segment_lists, segmentId, encodedToken;

chai.use(chaiHttp);

describe("Email list bulk options TESTS", () => {
    /*
     * Test the email list bulk options [bulk remove, bulk transfer, bulk merge]
     */
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        }
    });

    beforeEach(() => { });

    before(done => {
        /* Before each test we empty the database */
        commonFunction.sequalizedDb(["email_lists", "subscribers", "contacts", "custom_filter_fields", "custom_fields", "sections", "smtp_statistics", "segment_lists", "clicked_links", "template_links", "user_details", "users", "user_roles", "permission_sets"]).then(() => {
            email_lists = generatedSampleData.createdSampleData("email_lists", 1);
            subscribers = generatedSampleData.createdSampleData("subscribers", 1);
            contacts = generatedSampleData.createdSampleData("contacts", 3);
            segment_lists = generatedSampleData.createdSampleData("segment_lists", 1);

            const role = generatedSampleData.createdSampleData("user_roles", 1);
            const permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 1)[0];
            commonFunction.addDataToTable("user_roles", role[0]).then(role_data => {
                user.role_id = role_data.id;
                section = generatedSampleData.createdSampleData("sections", 1);
                commonFunction.addDataToTable("sections", section[0])
                    .then((data) => {
                        sectionBody = data;
                        customField = generatedSampleData.createdSampleData("custom_fields", 1);
                        customField[0].type = "BOTH";
                        customField[0].table_name = "contacts";
                        customField[0].section_id = sectionBody.id;
                        commonFunction.addDataToTable("custom_fields", customField[0])
                            .then((data) => {
                                customFieldBody = data;
                                // done();
                            });
                    });
                commonFunction.addDataToTable("permission_sets", permission[0]).then(permission_data => {
                    user.permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user).then(data => {
                        done();
                    });
                });
            });
        });
    });

    it("it should be login user with token and credential", () => {
        return chai.request(server)
            .post("/api/users/login")
            .send(user)
            .then(res => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.token.should.be.a("string");
                token = res.body.token;
                res.body.user.should.be.a("object");
                res.body.user.first_name.should.be.eql(user.first_name);
                res.body.user.last_name.should.be.eql(user.last_name);
                res.body.user.email.should.be.eql(user.email);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("It should POST an Email List to create a new List and get list data successfully", () => {
        return chai
            .request(server)
            .post("/api/emaillist")
            .set({
                Authorization: token
            })
            .send(email_lists[0])
            .then(res => {
                res.should.have.status(200);
                const body = res.body;
                body.should.be.a("object");
                body.success.should.be.eql(true);
                body.data.should.be.a("object");
                createdList.push(body.data);
                body.data.id.should.a("number");
                //to be used in add segment case
                email_list_id.push(res.body.data.id);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });


    for (let i = 0; i < 3; i++) {
        it("adding contacts to list to check bulk options", () => {
            return chai.request(server)
                .post("/api/emaillist/addcontact")
                .set({
                    Authorization: token
                })
                .send(Object.assign(contacts[i], {
                    entity_id: 1
                }))
                .then(res => {
                    const body = res.body;
                    contactIdToSend.push(body.data.id)
                    res.should.have.status(200);
                    body.should.be.a("object");
                    body.success.should.be.eql(true);
                    body.data.should.be.a("object");
                    body.data.id.should.a("number");
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    }

    /* add subscriber test cases*/
    describe('/POST add contacts to list - API(/api/emaillist/addContactToList)', () => {
        it('it should not add contact to list without token', () => {
            return chai
                .request(server)
                .post(`/api/emaillist/addContactToList`)
                .then((response) => {
                    response.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should add contact to list with token', () => {
            return chai
                .request(server)
                .post(`/api/emaillist/addContactToList`)
                .set({ Authorization: token })
                .send({
                    "listId": email_list_id[0],
                    "contactId": contactIdToSend
                })
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.should.have.property("data");
                    body.data.should.be.a("array");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not add 0 length contact to list with token', () => {
            const contactId = [];
            return chai
                .request(server)
                .post(`/api/emaillist/addContactToList`)
                .set({ Authorization: token })
                .send({
                    "listId": email_list_id[0],
                    "contactId": contactId
                })
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(422);
                    body.should.have.property("success");
                    body.should.have.property("message");
                    body.success.should.be.eql(false);
                    body.message.should.be.eql('No contacts received');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should add 1 length contact to list with token', () => {
            contactId = contactIdToSend.slice(0, 1);
            return chai
                .request(server)
                .post(`/api/emaillist/addContactToList`)
                .set({ Authorization: token })
                .send({
                    "listId": email_list_id[0],
                    "contactId": contactId
                })
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(200);
                    body.should.have.property("success");
                    body.success.should.be.eql(true);
                    body.data.should.be.a("object");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /* getEmailListDetails test cases */
    describe('/GET getEmailListDetails test cases = API(/api/emaillist/getEmailListDetailsByIds)', () => {
        it('it should not get emaillists without token', () => {
            return chai
                .request(server)
                .get(`/api/emaillist/getEmailListDetailsByIds?filter=${JSON.stringify({ "listId": [email_list_id[0]] })}`)
                .then((response) => {
                    response.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not get emaillists from the list with token and blank email list id', () => {
            return chai
                .request(server)
                .get(`/api/emaillist/getEmailListDetailsByIds?filter=${JSON.stringify({ "listId": [] })}`)
                .set({ Authorization: token })
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(422);
                    body.success.should.be.eql(false);
                    body.should.have.property("message");
                    body.message.should.be.eql('Empty Email Ids received');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should get emaillists from the list with token and email list id', () => {
            return chai
                .request(server)
                .get(`/api/emaillist/getEmailListDetailsByIds?filter=${JSON.stringify({ "listId": [email_list_id[0]] })}`)
                .set({ Authorization: token })
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.should.have.property("data");
                    body.data.should.be.a("array");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /* getAllContacts test cases */
    describe('/GET allContacts test cases = API(/api/emaillist/getAllContacts)', () => {
        it('it should not get contacts from list without token', () => {
            return chai
                .request(server)
                .get(`/api/emaillist/getAllContacts`)
                .then((response) => {
                    response.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should get all contacts from the list with token', () => {
            return chai
                .request(server)
                .get(`/api/emaillist/getAllContacts`)
                .set({ Authorization: token })
                .then((response) => {
                    const body = response.body;
                    if (response.body.data.length) {
                        contactsData = response.body.data[0].email
                    }
                    response.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.should.have.property("data");
                    body.data.should.be.a("array");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /* getContactLead API test cases */
    describe('/GET the contact lead API test cases = API(/api/emaillist/getContactLead)', () => {

        it("it should not get the contact lead object of the contact without token", () => {
            return chai.request(server)
                .get(`/api/emaillist/getContactLead/${contactId}`)
                .then(response => {
                    response.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should not get the contact lead object of the contact with invalid conactId with token", () => {
            return chai.request(server)
                .get(`/api/emaillist/getContactLead/abac`)
                .set({ Authorization: token })
                .then(response => {
                    const body = response.body;
                    response.should.have.status(422);
                    body.should.have.property("message");
                    body.message.should.be.eql('Invalid Route');
                    body.should.have.property("success");
                    body.success.should.be.eql(false);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should get the contact lead object of the contact with token", () => {
            return chai.request(server)
                .get(`/api/emaillist/getContactLead/${contactId}`)
                .set({ Authorization: token })
                .then(response => {
                    const body = response.body;
                    response.should.have.status(200);
                    body.should.have.property("data");
                    body.data.should.be.a("array");
                    body.should.have.property("success");
                    body.success.should.be.eql(true);
                    body.data[0].should.have.property("lead_client");
                    // body.data[0].lead_client.should.be.a("object");
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /* Copy Email list and its subscribers test cases*/
    describe("/Copy Email list and its subscribers", () => {

        it("It should not Copy an Email List without List Name", () => {
            //deleting list_name before passing
            var list = email_lists[0];
            delete list.list_name;
            return chai
                .request(server)
                .post("/api/emaillist/copylist/" + email_list_id[0])
                .set({
                    Authorization: token
                })
                .send(list)
                .then(res => {
                    const body = res.body;
                    res.should.have.status(422);
                    body.should.be.a("object");
                    body.should.have.property('success');
                    body.should.have.property('message');
                    body.success.should.be.eql(false);
                    body.message.should.be.eql("List Name is required.");
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("It should Copy an Email List and all subscribers", () => {
            email_lists[0].list_name = "Bruce Wayne";
            return chai
                .request(server)
                .post("/api/emaillist/copylist/" + email_list_id[0])
                .set({
                    Authorization: token
                })
                .send(email_lists[0])
                .then(res => {
                    const body = res.body;
                    createdList.push(res.body);
                    res.should.have.status(200);
                    body.should.be.a("object");
                    body.should.have.property('success');
                    body.should.have.property('message');
                    body.should.have.property('subscriberLength');
                    body.should.have.property('subscribersCopied');
                    body.success.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /* getListSubscribers/:listId test cases*/
    describe("/Get List Subscribers ", () => {
        it("it should not get the list subscribers without token", () => {
            return chai.request(server)
                .get(`/api/emaillist/getListSubscribers/${email_list_id[0]}`)
                .then(response => {
                    response.should.have.status(401);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should not get the list subscribers with token", () => {
            return chai.request(server)
                .get(`/api/emaillist/getListSubscribers/adada`)
                .set({ Authorization: token })
                .then(response => {
                    const body = response.body;
                    response.should.have.status(422);
                    body.should.have.property("message");
                    body.message.should.be.eql("Invalid Route.");
                    body.should.have.property("success");
                    body.success.should.be.eql(false);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it("it should get the list subscribers with token", () => {
            return chai.request(server)
                .get(`/api/emaillist/getListSubscribers/${email_list_id[0]}`)
                .set({ Authorization: token })
                .then(response => {
                    const body = response.body;
                    subscriberList = body.data;
                    response.should.have.status(200);
                    body.should.have.property("data");
                    body.data.should.be.a("array");
                    body.should.have.property("success");
                    body.success.should.be.eql(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /* updateEmailListSubscribers test cases */
    describe('/Delete updateEmailListSubscribers test cases = API(/api/emaillist/updateEmailListSubscribers)', () => {
        it('it should not delete emaillists without token', () => {
            return chai
                .request(server)
                .delete(`/api/emaillist/updateEmailListSubscribers`)
                .send(
                    {
                        "listId": [email_list_id[0]],
                        "subscriberId": subscriberList[0].id
                    }
                )
                .then((response) => {
                    response.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not delete emaillists with token but without subscriberId', () => {
            return chai
                .request(server)
                .delete(`/api/emaillist/updateEmailListSubscribers`)
                .send(
                    {
                        "listId": [email_list_id[0]],
                        "subscriberId": ''
                    }
                )
                .set({ Authorization: token })
                .then((response) => {
                    const body = response.body;
                    body.success.should.be.eql(false);
                    body.should.have.property("message");
                    body.message.should.be.eql('No Subscriber Id recieved to remove.');
                    response.should.have.status(422);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not delete emaillists with token but without listId', () => {
            return chai
                .request(server)
                .delete(`/api/emaillist/updateEmailListSubscribers`)
                .send(
                    {
                        "listId": [],
                        "subscriberId": subscriberList[0].id
                    }
                )
                .set({ Authorization: token })
                .then((response) => {
                    const body = response.body;
                    body.success.should.be.eql(false);
                    body.should.have.property("message");
                    body.message.should.be.eql('No List Id recieved to remove.');
                    response.should.have.status(422);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should delete the emaillists with token and with listId', () => {
            return chai
                .request(server)
                .delete(`/api/emaillist/updateEmailListSubscribers`)
                .send(
                    {
                        "listId": [email_list_id[0]],
                        "subscriberId": subscriberList[0].id
                    }
                )
                .set({ Authorization: token })
                .then((response) => {
                    const body = response.body;
                    body.success.should.be.eql(true);
                    body.should.have.property("message");
                    body.message.should.be.eql('Subscribers removed successfully from the list.');
                    response.should.have.status(200);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /* saveContactFilter test cases */
    describe('/POST saveContactFilter test cases = API(/api/emaillist/contactfilter/save)', () => {
        it('it should not saveContactFilter without token', () => {
            return chai
                .request(server)
                .post(`/api/emaillist/contactfilter/save`)
                .send(
                    {
                        "filterJson": [{ id: null, custom_field_id: 5, option: "$like", value: "sid" }],
                        "list_id": email_list_id[0]
                    }
                )
                .then((response) => {
                    response.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should saveContactFilter with token', () => {
            return chai
                .request(server)
                .post(`/api/emaillist/contactfilter/save`)
                .set({ Authorization: token })
                .send(
                    {
                        "filterJson": [{ id: null, custom_field_id: 5, option: "$like", value: "sid" }],
                        "list_id": email_list_id[0],
                    }
                )
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(200);
                    body.should.have.property("type");
                    body.should.have.property("user_id");
                    body.should.have.property("list_id");
                    body.should.have.property("filterJson");
                    body.should.have.property("updatedAt");
                    body.should.have.property("createdAt");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should saveContactFilter with token', () => {
            return chai
                .request(server)
                .post(`/api/emaillist/contactfilter/save`)
                .set({ Authorization: token })
                .send(
                    {
                        "filterJson": [{ id: null, custom_field_id: 5, option: "$like", value: "%a%" }],
                        "list_id": email_list_id[0]
                    }
                )
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(200);
                    body.should.have.property("type");
                    body.should.have.property("user_id");
                    body.should.have.property("list_id");
                    body.should.have.property("filterJson");
                    body.should.have.property("updatedAt");
                    body.should.have.property("createdAt");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /* getContactFilter test cases */
    describe('/GET getContactFilter test cases = API(/api/emaillist/contactfilter/listId)', () => {
        it('it should not get getContactFilter without token', () => {
            return chai
                .request(server)
                .get(`/api/emaillist/contactfilter/${email_list_id[0]}`)
                .then((response) => {
                    response.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not get getContactFilter with token but invalid list_id', () => {
            return chai
                .request(server)
                .get(`/api/emaillist/contactfilter/abc`)
                .set({ Authorization: token })
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(422);
                    body.success.should.be.eql(false);
                    body.should.have.property("message");
                    body.message.should.be.eql('No List Id recieved');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should getContactFilter with token', () => {
            return chai
                .request(server)
                .get(`/api/emaillist/contactfilter/${email_list_id[0]}`)
                .set({ Authorization: token })
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(200);
                    body.should.have.property("filterJson");
                    body.should.have.property("createdAt");
                    body.should.have.property("updatedAt");
                    body.should.have.property("type");
                    body.should.have.property("list_id");
                    body.should.have.property("user_id");
                    body.should.have.property("id");
                    // body.success.should.be.eql(true);
                    // body.data.should.be.a('Array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    /* removeSubscriber hard-bounce/reported-spam test cases */
    describe('/DELETE removeSubscriber test cases = API(/api/emaillist/statistics/removeSubscriber)', () => {
        it('it should not removeSubscriber without token', () => {
            return chai
                .request(server)
                .delete(`/api/emaillist/statistics/removeSubscriber`)
                .send(
                    {
                        deleteData: {
                            "subscriber_id": [],
                            "list_id": email_list_id[0]
                        }
                    }
                )
                .then((response) => {
                    response.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not removeSubscriber with token and no subscriber id', () => {
            return chai
                .request(server)
                .delete(`/api/emaillist/statistics/removeSubscriber`)
                .set({ Authorization: token })
                .send(
                    {
                        deleteData: {
                            "subscriber_id": [],
                            "list_id": email_list_id[0]
                        }
                    }
                )
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(422);
                    body.success.should.be.eql(false);
                    body.should.have.property("message");
                    body.message.should.be.eql('No Subscriber Id recieved to remove.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not removeSubscriber with token and no list id', () => {
            return chai
                .request(server)
                .delete(`/api/emaillist/statistics/removeSubscriber`)
                .set({ Authorization: token })
                .send(
                    {
                        deleteData: {
                            "subscriber_id": [subscriberList[0].id],
                            "list_id": ''
                        }
                    }
                )
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(422);
                    body.success.should.be.eql(false);
                    body.should.have.property("message");
                    body.message.should.be.eql('No List Id recieved to remove.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should removeSubscriber with token', () => {
            return chai
                .request(server)
                .delete(`/api/emaillist/statistics/removeSubscriber`)
                .set({ Authorization: token })
                .send(
                    {
                        deleteData: {
                            "subscriber_id": [subscriberList[0].id],
                            "list_id": email_list_id[0]
                        }
                    }
                )
                .then((response) => {
                    const body = response.body;
                    response.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.should.have.property("message");
                    body.message.should.be.eql('Subscribers removed successfully from the list.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });
});

/* webhook test cases */
describe('/POST removeSubscriber test cases = API(/api/emaillist/statistics/webhook)', () => {
    it('it should webhook token', () => {
        return chai
            .request(server)
            .post(`/api/emaillist/statistics/webhook`)
            .send(
                {
                    "event": "open",
                    "sender": "exampleuser@example.org",
                    "client": "Thunderbird 2.0",
                    "Subject": "Mail test - please ignore",
                    "time": "2019-06-18 16:10:32.977062",
                    "opened-at": "2016-04-18T01:09:40Z",
                    "rcpt": contactsData,
                    "srchost": "172.31.15.15",
                    "auth": "exampleuser33905",
                    "email_id": "1WFAMs-BI6MKi-K9",
                    "Message-Id": "<mail.1392590358.22776@example.org>",
                    "user-agent": "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1.14) Gecko/20080505 Thunderbird/2.0.0.14",
                    "read-secs": "60",
                    "X-List-Id": [email_list_id[0], email_list_id[1]]
                }
            )
            .then((response) => {
                const body = response.body;
                response.should.have.status(200);
                body.success.should.be.eql(true);
                body.should.have.property("isUpdated");
                body.should.have.property("data");
                body.should.have.property("requestBody");
                body.data.should.be.a("array");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should webhook token', () => {
        return chai
            .request(server)
            .post(`/api/emaillist/statistics/webhook`)
            .send(
                {
                    "event": "reject",
                    "sender": "exampleuser@example.org",
                    "client": "Thunderbird 2.0",
                    "Subject": "Mail test - please ignore",
                    "time": "2019-06-18 16:10:32.977062",
                    "opened-at": "2016-04-18T01:09:40Z",
                    "rcpt": contactsData,
                    "srchost": "172.31.15.15",
                    "auth": "exampleuser33905",
                    "email_id": "1WFAMs-BI6MKi-K9",
                    "Message-Id": "<mail.1392590358.22776@example.org>",
                    "user-agent": "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1.14) Gecko/20080505 Thunderbird/2.0.0.14",
                    "read-secs": "60",
                    "X-List-Id": [email_list_id[0]]
                }
            )
            .then((response) => {
                const body = response.body;
                response.should.have.status(200);
                body.success.should.be.eql(true);
                body.should.have.property("isUpdated");
                body.should.have.property("data");
                body.should.have.property("requestBody");
                body.data.should.be.a("array");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    it('it should webhook token', () => {
        return chai
            .request(server)
            .post(`/api/emaillist/statistics/webhook`)
            .send(
                {
                    "event": "spam",
                    "sender": "exampleuser@example.org",
                    "client": "Thunderbird 2.0",
                    "Subject": "Mail test - please ignore",
                    "time": "2019-06-18 16:10:32.977062",
                    "opened-at": "2016-04-18T01:09:40Z",
                    "rcpt": contactsData,
                    "srchost": "172.31.15.15",
                    "auth": "exampleuser33905",
                    "email_id": "1WFAMs-BI6MKi-K9",
                    "Message-Id": "<mail.1392590358.22776@example.org>",
                    "user-agent": "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1.14) Gecko/20080505 Thunderbird/2.0.0.14",
                    "read-secs": "60",
                    "X-List-Id": [email_list_id[0]]
                }
            )
            .then((response) => {
                const body = response.body;
                response.should.have.status(200);
                body.success.should.be.eql(true);
                body.should.have.property("isUpdated");
                body.should.have.property("data");
                body.should.have.property("requestBody");
                body.data.should.be.a("array");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should webhook token', () => {
        return chai
            .request(server)
            .post(`/api/emaillist/statistics/webhook`)
            .send(
                {
                    "event": "bounce",
                    "sender": "exampleuser@example.org",
                    "client": "Thunderbird 2.0",
                    "Subject": "Mail test - please ignore",
                    "time": "2019-06-18 16:10:32.977062",
                    "opened-at": "2016-04-18T01:09:40Z",
                    "rcpt": contactsData,
                    "srchost": "172.31.15.15",
                    "auth": "exampleuser33905",
                    "email_id": "1WFAMs-BI6MKi-K9",
                    "Message-Id": "<mail.1392590358.22776@example.org>",
                    "user-agent": "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1.14) Gecko/20080505 Thunderbird/2.0.0.14",
                    "read-secs": "60",
                    "X-List-Id": [email_list_id[0]]
                }
            )
            .then((response) => {
                const body = response.body;
                response.should.have.status(200);
                body.success.should.be.eql(true);
                body.should.have.property("isUpdated");
                body.should.have.property("data");
                body.should.have.property("requestBody");
                body.data.should.be.a("array");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should webhook token', () => {
        return chai
            .request(server)
            .post(`/api/emaillist/statistics/webhook`)
            .send(
                {
                    "event": "unsubscribe",
                    "sender": "exampleuser@example.org",
                    "client": "Thunderbird 2.0",
                    "Subject": "Mail test - please ignore",
                    "time": "2019-06-18 16:10:32.977062",
                    "opened-at": "2016-04-18T01:09:40Z",
                    "rcpt": contactsData,
                    "srchost": "172.31.15.15",
                    "auth": "exampleuser33905",
                    "email_id": "1WFAMs-BI6MKi-K9",
                    "Message-Id": "<mail.1392590358.22776@example.org>",
                    "user-agent": "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1.14) Gecko/20080505 Thunderbird/2.0.0.14",
                    "read-secs": "60",
                    "X-List-Id": [email_list_id[0]]
                }
            )
            .then((response) => {
                const body = response.body;
                response.should.have.status(200);
                body.success.should.be.eql(true);
                body.should.have.property("isUpdated");
                body.should.have.property("data");
                body.should.have.property("requestBody");
                body.data.should.be.a("array");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


});

/*  Add Segments route */
describe("/POST Segment - API(/api/emaillist/<list_id>/addsegment)", () => {
    it("it should not POST and able to Create an Segment List without token", () => {
        return chai
            .request(server)
            .post("/api/emaillist/" + [email_list_id[0]] + "/addsegment")
            .send(segment_lists[0])
            .then(res => {
                res.should.have.status(401);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("It should POST a Segment to add a Segment to list and get added segment data", () => {
        return chai
            .request(server)
            .post("/api/emaillist/" + [email_list_id[0]] + "/addsegment")
            .set({
                Authorization: token
            })
            .send(segment_lists[0])
            .then(res => {
                res.should.have.status(200);
                const body = res.body;
                segmentId = body.data.id;
                body.should.be.a("object");
                body.success.should.be.eql(true);
                body.data.should.be.a("object");
                body.data.id.should.a("number");
                body.data.should.have.property("id").that.is.a("number");
                body.data.should.have.property("segment_name").that.is.a("string");
                body.data.should.have.property("segment_description");
                body.data.should.have.property("created_by");
                body.data.should.have.property("list_id");
                body.data.should.have.property("createdAt");
                body.data.should.have.property("updatedAt");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

});

/* getlistStatistics test cases */
describe('/GET getlistStatistics test cases = API(/api/emaillist/statistics/byId)', () => {
    it('it should not get getlistStatistics without token', () => {
        return chai
            .request(server)
            .get(`/api/emaillist/statistics/byId?id=${email_list_id[0]}&type=list`)
            .then((response) => {
                response.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should not get getlistStatistics with token but no id', () => {
        return chai
            .request(server)
            .get(`/api/emaillist/statistics/byid?id=aa&type=list`)
            .set({ Authorization: token })
            .then((response) => {
                const body = response.body;
                response.should.have.status(422);
                body.success.should.be.eql(false);
                body.should.have.property("message");
                body.message.should.be.eql('Invalid list identifier!');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should get getlistStatistics with token', () => {
        return chai
            .request(server)
            .get(`/api/emaillist/statistics/byId?id=${email_list_id[0]}&type=list`)
            .set({ Authorization: token })
            .then((response) => {
                const body = response.body;
                response.should.have.status(200);
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a('Array');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should get getlistStatistics with token', () => {
        let date = new Date();
        date.setMonth(date.getMonth() - 3);
        return chai
            .request(server)
            .get(`/api/emaillist/statistics/byId?id=${email_list_id[0]}&type=list&startDate=${date}&endDate=${new Date()}`)
            .set({ Authorization: token })
            .then((response) => {
                const body = response.body;
                response.should.have.status(200);
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a('Array');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should get getlistStatistics with token', () => {
        return chai
            .request(server)
            .get(`/api/emaillist/statistics/byId?id=${email_list_id[0]}&type=segment&segment_id=${segmentId}`)
            .set({ Authorization: token })
            .then((response) => {
                const body = response.body;
                response.should.have.status(200);
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a('Array');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

/*  Add clicked template links in the database in clicked_links table*/
describe("/POST - API(/api/emaillist/statistics/trackClicks)", () => {

    before((done) => {
        /* Add a template links to check for the existing template links */
        let templateLinkobj = {
            text: "click",
            href: "www.google.com",
            list_id: 1,
            campaign_id: 1
        };
        commonFunction.addDataToTable("template_links", templateLinkobj).then((data) => {
            encodedToken = jwt.sign({ template_link_id: data.id, subscriber_id: 1 }, CONFIG.jwt.encryption);
            done();
        });
    });

    it("it should not POST and able to save a clicked link of template without token", () => {
        return chai
            .request(server)
            .post(`/api/emaillist/statistics/trackClicks`)
            .send({})
            .then(res => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property("success");
                res.body.success.should.be.eql(false);
                res.body.should.have.property("message");
                res.body.message.should.be.eql("Invalid parameters!");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should POST and able to save a clicked link of template with token", () => {
        return chai
            .request(server)
            .post(`/api/emaillist/statistics/trackClicks`)
            .send({ token: encodedToken })
            .then(res => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property("success");
                res.body.success.should.be.eql(true);
                res.body.should.have.property("message");
                res.body.message.should.be.eql("Clicked linked save in the database");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
});

/* custom-fields add test cases */
describe("Add custom fields for the get custom field test cases", () => {
    before((done) => {
        mainBody = {};
        mainBody['sections'] = [];
        mainBody['deleted_section'] = [];
        mainBody['deleted_custom_fields'] = [];
        mainBody['sections'].push(section[0]);
        mainBody['sections'][0].custom_fields = [];
        customFieldBody.id = null;
        customFieldBody.section_id = null;
        mainBody['sections'][0].custom_fields.push(customFieldBody);
        done();
    });

    [
        'currency',
        'country_dropdown',
        'lead_owner',
        'sales_stage'
    ].forEach((control_type) => {
        it('it should add custom fields for the get custom field test cases', () => {
            mainBody['sections'][0].custom_fields[0].control_type = control_type;
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    // res.body.sections.length.should.be.eql(1);
                    res.body.message[0].should.be.eql("Section Created Successfully.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });
});

/* getContactCustomFields API test cases */
describe("/getContactCustomFields API test cases", () => {
    it("it should not getContactCustomFields from the contacts table without token", () => {
        return chai.request(server)
            .get(`/api/emaillist/contactcustomfields`)
            .then(response => {
                response.should.have.status(401);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should get the contact lead object of the contact with token", () => {
        return chai.request(server)
            .get(`/api/emaillist/contactcustomfields`)
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                customFieldId = body.fields[0].id;
                response.should.have.status(200);
                body.should.have.property("fields");
                body.fields.should.be.a("array");
                body.should.have.property("success");
                body.success.should.be.eql(true);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
});

/* Custom filter contacts and subscribers API test cases */
describe("/Custom filter contacts API test cases", () => {

    it("it should not contactfilter from the contacts table without token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: [{ custom_field_id: 5, option: "$eq", value: "aa" }],
                list_id: "1"
            })
            .then(response => {
                response.should.have.status(401);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should not contactfilter from the contacts table with token but without active tab", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "",
                fields: [{ custom_field_id: 5, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(false);
                body.should.have.property("message").that.is.a("string");
                body.message.should.be.eql("Unknown request.");
                response.should.have.status(422);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should not contactfilter from the contacts table with token but without active tab", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "",
                fields: [{ custom_field_id: 6, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(false);
                body.should.have.property("message").that.is.a("string");
                body.message.should.be.eql("Unknown request.");
                response.should.have.status(422);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter all contact from the contacts table if fields are blank with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: "",
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter all susbcribers from the susbcribers table if fields are blank with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "view",
                fields: "",
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter contact from the contacts table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: [{ custom_field_id: customFieldId, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter contact from the contacts table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: [{ custom_field_id: 5, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter contact from the contacts table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: [{ custom_field_id: 6, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter contact from the contacts table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: [{ custom_field_id: 7, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter contact from the contacts table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: [{ custom_field_id: 8, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter contact from the contacts table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: [{ custom_field_id: 5, option: "$eq", value: null }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter contact from the contacts table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "add",
                fields: [{ custom_field_id: 5, option: "$isNull", value: null }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter subscriber from the subscribers table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "view",
                fields: [{ custom_field_id: 5, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should filter subscriber from the subscribers table with token", () => {
        return chai.request(server)
            .post(`/api/emaillist/contactfilter`)
            .send({
                active_tab: "view",
                fields: [{ custom_field_id: customFieldId, option: "$eq", value: "aa" }],
                list_id: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(response => {
                const body = response.body;
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("data");
                body.data.should.be.a("array");
                response.should.have.status(200);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
});

/* Bulk options transfer selected subscribers test cases */
describe("/Bulk transfer Subscribers from the list ", () => {
    it("it should not transfer selected subscribers from the list without token", () => {
        return chai.request(server)
            .put("/api/emaillist/bulk/transferViewSubscribers")
            .send({
                selectedSubscriberslist: '',
                to_list: email_list_id[0]
            })
            .then(res => {
                res.should.have.status(401);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should not transfer empty subscribers from the list with token", () => {
        return chai.request(server)
            .put("/api/emaillist/bulk/transferViewSubscribers")
            .send({
                selectedSubscriberslist: '',
                to_list: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(res => {
                const body = res.body;
                res.should.have.status(422);
                body.should.have.property("success");
                body.success.should.be.eql(false);
                body.should.have.property("message").that.is.a("string");
                body.message.should.be.eql("No subscribers list recieved");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should transfer selected subscribers from the list with token", () => {
        const subsId = [];
        subscriberList.forEach((subscriber) => {
            subsId.push(subscriber.id);
        });
        return chai.request(server)
            .put("/api/emaillist/bulk/transferViewSubscribers")
            .send({
                selectedSubscriberslist: subsId,
                to_list: email_list_id[0]
            })
            .set({ Authorization: token })
            .then(res => {
                const body = res.body;
                res.should.have.status(200);
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("message").that.is.a("string");
                body.message.should.be.eql("Subscribers transfer successfully.");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
})

/* Bulk options remove selected subscribers test cases */
describe("/Bulk Remove Subscribers from the list ", () => {
    // /bulk/transferViewSubscribers
    it("it should not remove selected subscribers from the list without token", () => {
        let subscribers = [], subscribersId = [];
        subscribers = subscriberList;
        subscribers.forEach((subscriber) => {
            subscribersId.push(subscriber.id);
        });
        return chai.request(server)
            .delete("/api/emaillist/bulk/removeSelectedSubscribersFromList")
            .send({
                subscriber_id: subscribersId
            })
            .then(res => {
                res.should.have.status(401);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should not remove empty subscribers from the list with token", () => {
        return chai.request(server)
            .delete("/api/emaillist/bulk/removeSelectedSubscribersFromList")
            .send({
                subscriber_id: ''
            })
            .set({ Authorization: token })
            .then(res => {
                const body = res.body;
                res.should.have.status(422);
                body.should.have.property("success");
                body.success.should.be.eql(false);
                body.should.have.property("message").that.is.a("string");
                body.message.should.be.eql("No Subscriber Id found to remove.");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should remove selected subscribers from the list with token", () => {
        subscriberList.forEach((subscriber) => {
            subscriberIdToSend.push(subscriber.id);
        });
        return chai.request(server)
            .delete("/api/emaillist/bulk/removeSelectedSubscribersFromList")
            .send({
                subscriber_id: subscriberIdToSend
            })
            .set({ Authorization: token })
            .then(res => {
                const body = res.body;
                res.should.have.status(200);
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("message").that.is.a("string");
                body.message.should.be.eql("Subscribers removed successfully from the list.");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
});

/* Bulk remove subscribers from list test cases */
describe("/Bulk Remove Subscribers from the list ", () => {

    it("it should not bulk remove subscribers from the list without token", () => {
        return chai.request(server)
            .delete("/api/emaillist/bulk/removelistsubscribers")
            .send({
                list_id: contactIdToSend
            })
            .then(res => {
                res.should.have.status(401);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should not bulk remove subscribers from the list and show message if list id not passed/invalid", () => {
        return chai.request(server)
            .delete("/api/emaillist/bulk/removelistsubscribers")
            .set({ Authorization: token })
            .then(res => {
                const body = res.body;
                res.should.have.status(422);
                body.should.have.property("success");
                body.success.should.be.eql(false);
                body.should.have.property("message").that.is.a("string");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should bulk remove subscribers from the list with token", () => {
        return chai
            .request(server)
            .delete("/api/emaillist/bulk/removelistsubscribers")
            .set({ Authorization: token })
            .send({
                list_id: contactIdToSend
            })
            .then(res => {
                const body = res.body;
                res.should.have.status(200);
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("message").that.is.a("string");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
});

/* Bulk transfer subscribers from list test cases */
describe("/Bulk Transfer Subscribers from the list to another", () => {

    it("it should not bulk transfer subscribers from a list without token", () => {
        return chai.request(server)
            .put("/api/emaillist/bulk/transferlistsubscribers")
            .send({
                selected_list: createdList[0],
                to_list: createdList[1]
            })
            .then(res => {
                res.should.have.status(401);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("it should bulk transfer subscribers from a list to another with token", () => {
        return chai.request(server)
            .put("/api/emaillist/bulk/transferlistsubscribers")
            .set({ Authorization: token })
            .then(res => {
                const body = res.body;
                res.should.have.status(200);
                body.should.have.property("success");
                body.success.should.be.eql(true);
                body.should.have.property("message").that.is.a("string");
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
});

/* Merge Email list and its subscribers test cases */
describe("/Merge Email list and its subscribers", () => {

    it("It should not Merge an Email List without token", () => {
        return chai.request(server)
            .put("/api/emaillist/bulk/mergelistsubscribers")
            .send({
                selected_list: createdList[0],
                merged_list: createdList[1],
                delete_merged: false
            })
            .then(res => {
                res.should.have.status(401);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    it("It should Merge an Email List and its subscriber with token", () => {
        return chai.request(server)
            .put("/api/emaillist/bulk/mergelistsubscribers")
            .set({
                Authorization: token
            })
            .send({
                selected_list: createdList[0],
                merged_list: createdList[1],
                delete_merged: true
            })
            .then(res => {
                const body = res.body;
                res.should.have.status(200);
                body.should.be.a("object");
                body.should.have.property('success');
                body.should.have.property('message');
                body.success.should.be.eql(true);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
});

after(done => {
    done();
});
