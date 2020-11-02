const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const imapHelper = require("./../../helpers/imapHelper");
const should = chai.should();
chai.use(chaiHttp);
const expect = chai.expect;
let IMAP;

let loggedInUser, token, user;

let emailProviders = {
    id: 29,
    email_provider_name: 'outlook'
}
let User = {
    email_provider_id: 29,
    email_user_name: 'hello@ripplecrm.co.uk',
};
let mailerTokenData = {

    email_user: 'hello@ripplecrm.co.uk',
    mailer_token: 'ya29.GlwLB3TqDshn6bGhaOxbGuDTotMZFF30m5sRhJdpqozLVPuIWV2z0qMgBBX6kPOVPNK-P_8RLQaiarOVd_p3VPEQhERd7Ss5aRvz3gg1RpoOnGpU-HRpQQeJDKOqEA',
    mailer_refresh_token: '',
    mailer_token_id: 1,

}

describe('OutlookMailer', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });
    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['users', 'permission_sets', 'user_roles', 'email_users', 'email_providers']).then(() => {
            const role = generatedSampleData.createdSampleData("user_roles", 1);
            const permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 1)[0]
            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user.role_id = role_data.id
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user.permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user).then((data) => {
                        commonFunction.addDataToTable("email_providers", emailProviders).then((data) => {
                            commonFunction.addDataToTable("email_users", User).then((data) => {
                                commonFunction.addDataToTable("mailer_tokens", mailerTokenData).then((data) => {
                                    done();
                                });
                            });
                        })
                    });
                })
            });
        });
    });
    it('it should be login user with token and credential', () => {
        return chai.request(server)
            .post('/api/users/login')
            .send(user)
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.token.should.be.a('string');
                token = res.body.token;
                loggedInUser = res.body.user;
                res.body.user.should.be.a('object');
                res.body.user.first_name.should.be.eql(user.first_name);
                res.body.user.last_name.should.be.eql(user.last_name);
                res.body.user.email.should.be.eql(user.email);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('first test case for  without authorization token', () => {
        return chai.request(server)
            .post('/api/mailer/generateRequest')
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller generateRequest with auth token', () => {
        return chai.request(server)
            .post('/api/mailer/generateRequest')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' })
            .then((res) => {
                console.log('@@@@@res.body', res.body);
                res.should.have.status(200);
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql("Auth request successfully created.");

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for outlook controller generateRequest with auth token and missing graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/generateRequest')
            .set({
                Authorization: token
            })
            .send({ provider: 'outlook' })
            .then((res) => {
                console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Email username can\'t empty");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('first test case for outlook controller generateRequest with auth token', () => {
        return chai.request(server)
            .post('/api/mailer/generateRequest')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' })
            .then((res) => {
                res.should.have.status(200);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //getFolders
    it('test case for outlook controller getFolders', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            // .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' })

            .then((res) => {
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller getFolders with authorization token', () => {
        return chai.request(server)
            .post('/api/mailer/getFolders')
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' })
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

   

    ////get Mail API
    it('test case for outlook controller getMail', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)

            // .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' })
            .then((res) => {
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller getMail with auth token and missing graph_user_name', () => {
        encodedObject = commonFunction.encodeToBase64({ provider: 'outlook' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ provider: 'outlook' })
            .then((res) => {
                console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in fetch mails");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    // it('first test case for google controller getMail with auth token and missing provider', () => {
    //     return chai.request(server)
    //         .post('/api/mailer/getMail')
    //         .set({
    //             Authorization: token
    //         })
    //         .send({ graph_user_name: 'ripple.cis2018@gmail.com'})
    //         .then((res) => {
    //             console.log('*********',res.body);
    //             res.should.have.status(200);
    //             res.body.message.should.be.eql("Invalid provider");


    //         }).catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });
    it('test case for outlook controller getMail with 200 code', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook' })
            .then((res) => {
                console.log(res.body);
                res.should.have.status(200);
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch mails");

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //getMailById API
    it('test case for outlook controller getMailById Invalid_token', () => {
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' });
        return chai.request(server)
            .post('/api/mailer/getMailById')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch mail by id");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('first test case for outlook controller getMailById with auth token and missing graph_user_name', () => {
        // encodedObject = commonFunction.encodeToBase64({ provider: 'outlook' });
        return chai.request(server)
            .post('/api/mailer/getMailById')
            .set({
                Authorization: token
            })
            .send({ provider: 'outlook' })
            .then((res) => {
                console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in fetch mail by id");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    //getMail For SelectAll Functionality for getMailToSelectAllForOutlook with invalid token

    it('test case for outlook controller getMailToSelectAllForOutlook Invalid_token', () => {
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' });
        return chai.request(server)
            .post('/api/mailer/getMailToSelectAllForOutlook')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch mails");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for outlook controller getMailToSelectAllForOutlook with auth token and missing graph_user_name', () => {
        // encodedObject = commonFunction.encodeToBase64({ provider: 'outlook' });
        return chai.request(server)
            .post('/api/mailer/getMailToSelectAllForOutlook')
            .set({
                Authorization: token
            })
            .send({ provider: 'outlook' })
            .then((res) => {
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in fetch mails");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    })



    //getFolders MailCount with invalid token


    it('test case for outlook controller getFoldersMailCount Invalid_token', () => {
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' });
        return chai.request(server)
            .post('/api/mailer/getFoldersMailCount')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch folders");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    // it('test case for outlook controller getFoldersMailCount Invalid_token', () => {
    //     encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' });
    //     return chai.request(server)
    //         // .get('/api/mailer/getFoldersMailCount/'+encodedObject)
    //         .post('/api/mailer/getFoldersMailCount')
    //         .set({
    //             Authorization: token
    //         })
    //         .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.message.should.be.a('string')
    //             res.body.message.should.be.eql("Error in fetch folders");
    //         }).catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });

    //update Mail API
    it('test case for outlook controller updateMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=', isRead: true })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email update");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('first test case for outlook controller updateMail with auth token and missing graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({ provider: 'outlook' })
            .then((res) => {
                console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in email update");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    //moveOrCopyMail
    it('test case for outlook controller moveOrCopyMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=', isRead: true })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in copy/move mail");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('first test case for outlook controller moveOrCopyMail with auth token and missing graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .set({
                Authorization: token
            })
            .send({ provider: 'outlook' })
            .then((res) => {
                console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in copy/move mail");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    // ////////////////////send Mail
    it('test case for outlook controller sendMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/sendMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "hello@ripplecrm.co.uk",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email sending");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller sendMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/sendMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                // "graph_user_name": "hello@ripplecrm.co.uk",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email sending");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    // //replayMail
    it('test case for outlook controller replayMail invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/replayMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "hello@ripplecrm.co.uk",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email replying");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller replayMail without graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/replayMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                //"graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email replying");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    // //createReplyMail
    it('test case for outlook controller createReplyMail invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                //"graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []
                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //Draft API
    it('test case for outlook controller draft invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/saveDraft')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "hello@ripplecrm.co.uk",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller draft without graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/saveDraft')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                //"graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //createReplyMail
    it('test case for outlook controller createReplyMail invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "hello@ripplecrm.co.uk",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller createReplyMail without graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                // "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Te st Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller updateMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email update");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller updateMail Invalid_token without authorization token', () => {
        return chai.request(server)
            .post('/api/mailer/updateMail')

            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller refresh Invalid_token without authorization token', () => {
        return chai.request(server)
            .post('/api/mailer/refresh')

            .send({})
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller refresh token ', () => {
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' });
        return chai.request(server)
            .post('/api/mailer/getAttachment')

            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
            .then((res) => {
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for outlook controller getAttachmentToGetContentData without graph_user_name', () => {
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' });
        return chai.request(server)
            .post('/api/mailer/getAttachmentToGetContentData')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch attachment");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller getAttachmentToGetContentData without graph_user_name', () => {
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: '', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' });
        return chai.request(server)
            .post('/api/mailer/getAttachmentToGetContentData')
            // .set({
            //     Authorization: token
            // })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=' })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(401);
                res.body.should.be.a('object');
                // res.body.message.should.be.a('string')
                // res.body.message.should.be.eql("Error in fetch attachment");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for outlook controller getAttachmentWithContentBytes without graph_user_name', () => {
        // encodedObject = commonFunction.encodeToBase64({
        //     graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=',
        //     attachmentId: 'asddfsfd'
        // });
        return chai.request(server)
            .post('/api/mailer/getAttachmentWithContentBytes')
            .set({
                Authorization: token
            })
            .send({
                graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=',
                attachmentId: 'asddfsfd'
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch attachment............");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for outlook controller getAttachmentWithContentBytes without graph_user_name ...', () => {
        // encodedObject = commonFunction.encodeToBase64({
        //     graph_user_name: '',
        //     provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=',
        //     attachmentId: 'asddfsfd'
        // });
        return chai.request(server)
            .post('/api/mailer/getAttachmentWithContentBytes')
            .set({
                Authorization: token
            })
            .send({
                provider: 'outlook', mail_id: 'AAMkAGRmZmU0N2M4LTc1MTItNDZiOS1hMGRlLWE1MTcyODNlMj…gxqfAAAAAAAEMAAALc8ma2UrURYzj9J9gxqfAAAAoNyMYAAA=',
                attachmentId: 'asddfsfd'
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch attachment^^^^^^^^^^^^");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    //forwordMail
    it('test case for outlook controller forwordMail invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/forwordMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "hello@ripplecrm.co.uk",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email forwording");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller forwordMail without graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/forwordMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                // "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "outlook",
                "mail": {
                    "message": {
                        "subject": "Testing email from custommmm",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dnyaneshphadatare@gmail.com"
                        ],
                        "Attachments": [],
                        "BccRecipients": [],
                        "Categories": [],
                        "CcRecipients": [],
                        "ReplyTo": []

                    }
                }
            })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in mail forwording");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    // //searchMail
    it('test case for outlook controller searchMail Invalid_token', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', searchText: 'test', offset: null });
        return chai.request(server)
            .get('/api/mailer/searchMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'outlook', searchText: 'test', offset: null })
            .then((res) => {
                console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email searching");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for outlook controller searchMail without graph_user_name', () => {
        encodedObject = commonFunction.encodeToBase64({ provider: 'outlook', searchText: 'test', offset: null });
        return chai.request(server)
            .get('/api/mailer/searchMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ provider: 'outlook', searchText: 'test', offset: null })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email searching");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

})
