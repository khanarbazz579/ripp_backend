const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const googleMailerController = require('../../controllers/mailerController/googleMailerController')
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const { google } = require('googleapis');

chai.use(chaiHttp);
const expect = chai.expect;
// var gmail = google.gmail({
//     auth: oAuth2Client,
//     version: 'v1'
// });

let loggedInUser, token, user;

let emailProviders = {
    id: 30,
    email_provider_name: 'google'
}
let User = {
    email_provider_id: 30,
    email_user_name: 'ripple.cis2018@gmail.com',
};
let mailerTokenData = {
    email_user: 'ripple.cis2018@gmail.com',
    mailer_token: 'ya29.GlwMB-lsFeIGaxy3lwaPdWYQMqyFk__lGyiOQq2gTFzyTpAQKjMWT-q8Hs2T2EaJp_ZaTnFnAHzrXDo_iHAcbx9TtVVQiuUbiNbW-hq6XROPqxZJc4r31VqGxB5A_g',
    mailer_refresh_token: '',
    mailer_token_id: 1,
}

describe('GoogleMailer', () => {
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
                            console.log('^^^^^^^^^^^^^^email Providers', data);
                            commonFunction.addDataToTable("email_users", User).then((data) => {
                                 console.log('@@@@@@@@@', User);
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
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    //updateMailArchived



    //getAttachmentList

    it('first test case for  without authorization token', () => {
        return chai.request(server)
            .post('/api/mailer/getAttachmentList')
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' })
            .then((res) => {
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    it('test case for google controller generateRequest with auth token', () => {
        return chai.request(server)
            .post('/api/mailer/generateRequest')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' })
            .then((res) => {
                res.should.have.status(200);
                res.body.message.should.be.a('string');

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller generateRequest with invalid user name and auth token', () => {
        return chai.request(server)
            .post('/api/mailer/generateRequest')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'ripple1.cis2018@gmail.com', provider: 'google' })
            .then((res) => {
                res.should.have.status(200);
                res.body.message.should.be.a('string');

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller generateRequest with auth token', () => {
        return chai.request(server)
            .post('/api/mailer/generateRequest')
            .set({
                Authorization: token
            })
            .send({ provider: 'google' })
            .then((res) => {
                res.should.have.status(200);
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql("Email username can't empty");

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    it('test case for google controller refresh token token', () => {
        return chai.request(server)
            .get('/api/mailer/googlerefresh')
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('first test case for google controller googleAuthorize without code', () => {
        return chai.request(server)
            .get('/api/mailer/googleAuthorize')
            .then((res) => {
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('first test case for google controller googleAuthorize with code', () => {
        return chai.request(server)
            .get('/api/mailer/googleAuthorize?code=testing')
            .then((res) => {
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller getFolders', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            // .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' })

            .then((res) => {
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller getFolders with authorization token', () => {
        return chai.request(server)
            .post('/api/mailer/getFolders')
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' })
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller getFolders with auth token and missing graph_user_name', () => {
        encodedObject = commonFunction.encodeToBase64({ provider: 'google' });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ provider: 'google' })
            .then((res) => {
                // console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in fetch folders");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //getMailToSelectAll
    it('test case for google controller getMailToSelectAll', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google',limit:10 });
        return chai.request(server)
            .get('/api/mailer/getMailToSelectAll/'+encodedObject)

            // .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google',limit:10 })
            .then((res) => {
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller getMailToSelectAll with auth token and missing graph_user_name', () => {
        encodedObject = commonFunction.encodeToBase64({ provider: 'google' });
        return chai.request(server)
            .get('/api/mailer/getMailToSelectAll/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ provider: 'google' })
            .then((res) => {
                //console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in fetch mails");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller getMailToSelectAll Invalid_token', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'ripple.cis2018@gmail.com'});
        return chai.request(server)
            .get('/api/mailer/getMailToSelectAll/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'ripple.cis2018@gmail.com'})
            .then((res) => {
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch mails");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller getMail', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)

            // .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' })
            .then((res) => {
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller getMail with auth token and missing graph_user_name', () => {
        encodedObject = commonFunction.encodeToBase64({ provider: 'google' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ provider: 'google' })
            .then((res) => {
                //console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in fetch mails");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller getMail with 200 code', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' })
            .then((res) => {
                //console.log(res.body);
                res.should.have.status(200);
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch mails");

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller getMailById Invalid_token', () => {
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google', mail_id: '16ac08a2405136ae' });
        return chai.request(server)
            .post('/api/mailer/getMailById')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google', mail_id: '16ac08a2405136ae' })
            .then((res) => {
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch mail by id");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('first test case for google controller getMailById with auth token and missing graph_user_name', () => {
        // encodedObject = commonFunction.encodeToBase64({ provider: 'google' });
        return chai.request(server)
            .post('/api/mailer/getMailById')
            .set({
                Authorization: token
            })
            .send({ provider: 'google' })
            .then((res) => {
                // console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in fetch mail by id");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    //updateMailArchived
    it('test case for google controller updateMailArchived Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/updateMailArchived')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google', mail_id: '16ac08a2405136ae' })
            .then((res) => {
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email update");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    
    it('test case for google controller updateMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google', mail_id: '16ac08a2405136ae', isRead: true })
            .then((res) => {
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email update");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //updateMailArchived
    it('first test case for  without authorization token', () => {
        return chai.request(server)
            .post('/api/mailer/updateMailArchived')
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google' })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller updateMailArchived Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/updateMailArchived')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', mail_id: '16ac08a2405136ae', isInbox: true })
            .then((res) => {
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email update");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('first test case for google controller updateMail with auth token and missing graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({ provider: 'google' })
            .then((res) => {
                // console.log('*********', res.body);
                res.should.have.status(200);
                res.body.message.should.be.eql("Error in email update");


            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller updateMail Invalid_token without authorization token', () => {
        return chai.request(server)
            .post('/api/mailer/updateMail')

            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google', mail_id: '16ac08a2405136ae' })
            .then((res) => {
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    // return chai.request(server)
    // .post('/api/mailer/sendMail')
    // .set({
    //     Authorization: token
    // })
    // .send({
    it('test case for google controller moveOrCopyMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google', mail_id: '16ac08a2405136ae', action: 'move', from_id: 'INBOX', destinaton_id: 'DRAFT' })
            .then((res) => {

                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in copy/move mail");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('first test case for google controller moveCopyProcess with auth token and missing graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/moveCopyProcess')
            .set({
                Authorization: token
            })
            .send({ resource:'16cb887c40a3b89f'})
            .then((res) => {
                console.log('moveOrCopy is done', res.body);
                res.should.have.status(200);
               // res.body.message.should.be.eql("Error in copy/move mail");


            }).catch(function(err) {
                return Promise.reject(err);
            });
    });


    it('test case for google controller sendMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/sendMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",
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
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email sending");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    it('test case for google controller forwordMail with token', () => {
        return chai.request(server)
            .post('/api/mailer/forwordMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",
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
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller sendMail Invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/sendMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',

                "provider": "google",
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
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email sending");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    //reply mail
    it('test case for google controller replayMail invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/replayMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",
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
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email replying");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller replayMail without graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/replayMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',

                "provider": "google",
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
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email replying");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller createReplyMail invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',

                "provider": "google",
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
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller createReplyMail invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",

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
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller draft invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/saveDraft')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",
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
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //draft API
    it('test case for google controller draft invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/saveDraft')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",
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
                //  console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller draft without graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/saveDraft')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',

                "provider": "google",
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
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller createReplyMail invalid_token', () => {
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",
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
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller createReplyMail without graph_user_name', () => {
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',

                "provider": "google",
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
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email saving");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('test case for google controller getAttachment ', () => {
        // encodedObject = commonFunction.encodeToBase64({
        //     "graph_user_name": "ripple.cis2018@gmail.com",
        //     "provider": "google",
        //     mail_id: '16ac08a2405136ae'
        // });
        return chai.request(server)
            .post('/api/mailer/getAttachment')

            .send({
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",
                mail_id: '16ac08a2405136ae'
            })
            .then((res) => {
                //console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller getAttachment without graph_user_name', () => {
        // encodedObject = commonFunction.encodeToBase64({
        //     "graph_user_name": "ripple.cis2018@gmail.com",
        //     "provider": "google",
        //     mail_id: '16ac08a2405136ae'
        // });
        return chai.request(server)
            .post('/api/mailer/getAttachment')
            .set({
                Authorization: token
            })
            .send({
                "graph_user_name": "ripple.cis2018@gmail.com",
                "provider": "google",
                mail_id: '16ac08a2405136ae'
            })
            .then((res) => {
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch attachment");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller searchMail Invalid_token', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google', searchText: 'test', offset: null });
        return chai.request(server)
            .get('/api/mailer/searchMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'ripple.cis2018@gmail.com', provider: 'google', searchText: 'test', offset: null })
            .then((res) => {
                // console.log('@@@@@@@@HEREEEE', res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in email searching");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('test case for google controller searchMail without graph_user_name', () => {
        encodedObject = commonFunction.encodeToBase64({ provider: 'google', searchText: 'test', offset: null });
        return chai.request(server)
            .get('/api/mailer/searchMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ provider: 'google', searchText: 'test', offset: null })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string')
                res.body.message.should.be.eql("Error in fetch mails");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    // it("Test case for getAttachmentList ", async() => {
    //     let email = await googleMailerController.getAttachmentList(1, {}, []);
    //     email.should.be.a('array');
    // })


    // it("Test case for getAttachmentList ", async() => {
    //     let parts = [{
    //             body: {
    //                 data: "Test"
    //             }
    //         },
    //         {
    //             body: {
    //                 data: "Test",
    //                 attachmentId: 45
    //             },
    //             filename: "test.txt",
    //             mimeType: "png"
    //         }
    //     ];
    //     let email = await googleMailerController.getAttachmentList(1, {
    //         users: {
    //             messages: {
    //                 attachments: {
    //                     get: function(obj, callback) {
    //                         callback(null, {
    //                             data: {
    //                                 id: 1,
    //                                 name: "test",
    //                                 messagesUnread: 50,
    //                                 messagesTotal: 60
    //                             }
    //                         })
    //                     }
    //                 }
    //             }
    //         }
    //     }, parts,false);

    //     email.should.be.a('array');
    // })

    it("Test case for getAttachmentById ", async () => {
        let email = await googleMailerController.getAttachmentById(1, false, { body: {}, filename: '', mimeType: '' });
        email.should.be.a('string');
        email.should.be.eql("Invalid client");
    })

    

    // it("Test cases for  moveCopyProcess ", async() => {
    //     let users = {
    //         users: {
    //             messages: {
    //                 modify: function(obj, callback) {
    //                     callback(null, {
    //                         data: {
    //                             id: 1,
    //                             name: "test",
    //                             messagesUnread: 50,
    //                             messagesTotal: 60
    //                         }
    //                     })
    //                 }
    //             }
    //         }
    //     }
    //     let email = await googleMailerController.moveCopyProcess(users, 1, { body: {}, filename: '', mimeType: '' });
    //     email.should.be.a('object');
    // })

    // it("Test cases for  moveCopyProcesswitg error", async() => {
    //     let users = {
    //         users: {
    //             messages: {
    //                 modify: function(obj, callback) {
    //                     callback("Error in process", {
    //                         data: {
    //                             id: 1,
    //                             name: "test",
    //                             messagesUnread: 50,
    //                             messagesTotal: 60
    //                         }
    //                     })
    //                 }
    //             }
    //         }
    //     }
    //     let email = await googleMailerController.moveCopyProcess(users, 1, { body: {}, filename: '', mimeType: '' });
    //     email.should.be.a('string');
    // })


    it("Test case for parseFullMessage ", async () => {
        let message = {
            payload: {
                parts: [{
                    body: {
                        data: "Test"
                    }
                }],
                headers: [{
                    name: "Date",
                    value: new Date()
                },
                {
                    name: "Subject",
                    value: "Test"
                },
                {
                    name: "From",
                    value: "tset@test.com"
                },
                {
                    name: "Reply-To",
                    value: "tset@test.com"
                },
                {
                    name: "Cc",
                    value: "tset@test.com"
                }
                ]
            }
        }
        let email = await googleMailerController.parseFullMessage(message);
        email.should.be.a('object');
    })


    // it("Test case for parseFullMessage without parts", async() => {
    //     let message = {
    //         payload: {
    //             body: {
    //                 data: "Test"
    //             },
    //             headers: [{
    //                     name: "Date",
    //                     value: new Date()
    //                 },
    //                 {
    //                     name: "Subject",
    //                     value: "Test"
    //                 },
    //                 {
    //                     name: "From",
    //                     value: "tset@test.com"
    //                 },
    //                 {
    //                     name: "Reply-To",
    //                     value: "tset@test.com"
    //                 },
    //                 {
    //                     name: "Cc",
    //                     value: "tset@test.com"
    //                 }
    //             ]
    //         }
    //     }
    //     let email = await googleMailerController.parseFullMessage(message);
    //     email.should.be.a('object');
    // })


    it("Test case for parseMessage ", async () => {
        let message = {
            payload: {
                parts: [{
                    body: {
                        data: "Test"
                    }
                }],
                headers: [{
                    name: "Date",
                    value: new Date()
                },
                {
                    name: "Subject",
                    value: "Test"
                },
                {
                    name: "From",
                    value: "tset@test.com"
                },
                {
                    name: "Reply-To",
                    value: "tset@test.com"
                },
                {
                    name: "Cc",
                    value: "tset@test.com"
                }
                ]
            }
        }
        let email = await googleMailerController.parseMessage(message);
        email.should.be.a('object');
    })

    it("Test case for getSignature ", async () => {
        let message =  {
            id: '16c89b9bcff2b1fc',
            threadId: '16c89b9878e8c02e',
            labelIds: [ 'IMPORTANT', 'SENT', 'INBOX' ],
            snippet: '',
            historyId: '309479',
            internalDate: '1565678755000',
            payload:
             { partId: '',
               mimeType: 'multipart/alternative',
               filename: '',
               headers:
                [ [Object],
                  [Object],
                  [Object],
                  [Object],
                  [Object],
                  [Object],
                  [Object] ],
               body: { size: 0 },
               parts: [ { partId: '0',
               mimeType: 'text/plain',
               filename: '',
               headers:
                [ { name: 'Content-Type', value: 'text/plain; charset="UTF-8"' } ],
               body: { size: 2, data: 'DQo=' } }, { partId: '1',
               mimeType: 'text/html',
               filename: '',
               headers:
                [ { name: 'Content-Type', value: 'text/html; charset="UTF-8"' },
                  { name: 'Content-Transfer-Encoding', value: 'quoted-printable' } ],
               body:
                { size: 297,
                  data:
                   'PGRpdiBkaXI9Imx0ciI-PGJyIGNsZWFyPSJhbGwiPjxkaXY-PGRpdiBkaXI9Imx0ciIgY2xhc3M9ImdtYWlsX3NpZ25hdHVyZSIgZGF0YS1zbWFydG1haWw9ImdtYWlsX3NpZ25hdHVyZSI-PGRpdiBkaXI9Imx0ciI-PGRpdj48ZGl2IGRpcj0ibHRyIj48ZGl2IGRpcj0ibHRyIj48aW1nIHNyYz0iaHR0cHM6Ly93d3cucmlwcGxlY3JtLmNvbS9hc3NldHMvZW1haWwvc2lnbmF0dXJlL1JpcHBsZV9Mb2dvQmx1ZS5qcGciPjxkaXY-PGJyPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2Pg0K' }, 
               }]
            }
        }
            
            let email = await googleMailerController.getSignature(message);
            email.should.be.a('object');
        })
        /////////////////////////////////////////////////////// another part to getSignature

        it("Test case for getSignature for another part", async () => {
            let message =  {
                id: '16c89b9bcff2b1fc',
                threadId: '16c89b9878e8c02e',
                labelIds: [ 'IMPORTANT', 'SENT', 'INBOX' ],
                snippet: '',
                historyId: '309479',
                internalDate: '1565678755000',
                payload:
                 { partId: '',
                   mimeType: 'multipart/alternative',
                   filename: '',
                   headers:
                    [ [Object],
                      [Object],
                      [Object],
                      [Object],
                      [Object],
                      [Object],
                      [Object] ],
                   body: { size: 0 },
                   parts: [ { partId: '0',
                   mimeType: 'multipart/alternative',
                   filename: '',
                   headers:
                    [ { name: 'Content-Type',
                        value:
                         'multipart/alternative; boundary="0000000000003e7522058ef96754"' } ],
                   body: { size: 0 },
                   parts:
                    [ { partId: '0.0',
                        mimeType: 'text/plain',
                        filename: '',
                        headers: [Array],
                        body: [Object] },
                      { partId: '0.1',
                        mimeType: 'text/html',
                        filename: '',
                        headers: [Array],
                        body: {
                            data:'ANGjdJ80cZE9zx-nsgaQoA96ylJ5ceGZsn9yzOOGL5KBYwsT4qUYn1XmF-ktrIHCQysRV2hmRwnSMMCEr6dRxEyb4zGI4JSDfHTn6npePUNObs1TDsu_7qtkMjY9DTlh9IHdbeLEQAVOmIM5mKFHiYtwuGa-xzbRkvJb3zOrALftiUJxp0e3WfvQEBBi0mBl2DmGtMzFQ_YaxMQW_cTjVCiNbDWO4MOSFPrEfboQiA'
                        } } ] }, { partId: '1',
                        mimeType: 'text/plain',
                        filename: 't1.txt',
                        headers:
                         [ { name: 'Content-Type',
                             value: 'text/plain; charset="US-ASCII"; name="t1.txt"' },
                           { name: 'Content-Disposition',
                             value: 'attachment; filename="t1.txt"' },
                           { name: 'Content-Transfer-Encoding', value: 'base64' },
                           { name: 'X-Attachment-Id', value: 'f_jyr8ki000' },
                           { name: 'Content-ID', value: '<f_jyr8ki000>' } ],
                        body:
                         { attachmentId:
                            'ANGjdJ8eQyrAMQexZ_zp9q8dzncvvzPOlsaokkFlt8lMxLAK5YqtLU0EXCzw5hgXsDhNihke8RPjcIKaBVKy7T4Y2YwlKOYmkpFQHic3b5WPvl5weu9PNHaG46_IcDM2eIhYNbzV4t-dy4_UxniZLkNQVwjyE4FtYkfIJH2q8eJUOiiYdnLLHbrl3G2YOCyjZtPKtScgpiL12Omx1OSPagbz18zIOA_BbTQDcFyUOw',
                           size: 3 } }]
                }
            }
                
                let email = await googleMailerController.getSignature(message);
                email.should.be.a('object');
            })



          
    
        it("Test case for getFolderDetail ", async () => {
        let email = await googleMailerController.getFolderDetail({
            users: {
                labels: {
                    get: function (obj, callback) {
                        callback(null, {
                            data: {
                                id: 1,
                                name: "test",
                                messagesUnread: 50,
                                messagesTotal: 60
                            }
                        })
                    }
                }
            }
        }, 1);
        email.should.be.a('object');
    })

    it("Test case for getFolderDetail with err", async () => {
        let email = await googleMailerController.getFolderDetail({
            users: {
                labels: {
                    get: function (obj, callback) {
                        callback("Error in fetching email", {
                            data: {
                                id: 1,
                                name: "test",
                                messagesUnread: 50,
                                messagesTotal: 60
                            }
                        })
                    }
                }
            }
        }, 1);
        email.should.be.a('string');
    })

    it("Test case for getMailDetails ", async () => {
        let email = await googleMailerController.getMailDetails({
            users: {
                messages: {
                    get: function (obj, callback) {
                        callback(false, {
                            data: {
                                id: 1,
                                labelIds: ['UNREAD'],
                                payload: {
                                    parts: [{
                                        body: {
                                            data: "Test"
                                        }
                                    }],
                                    headers: [{
                                        name: "Date",
                                        value: new Date()
                                    },
                                    {
                                        name: "Subject",
                                        value: "Test"
                                    },
                                    {
                                        name: "From",
                                        value: "tset@test.com"
                                    },
                                    {
                                        name: "Reply-To",
                                        value: "tset@test.com"
                                    },
                                    {
                                        name: "Cc",
                                        value: "tset@test.com"
                                    }
                                    ]
                                }
                            }
                        })
                    }
                }
            }
        }, 1);
        email.should.be.a('object');
    })


    it("Test case for getMailDetails with error ", async () => {
        let email = await googleMailerController.getMailDetails({
            users: {
                messages: {
                    get: function (obj, callback) {
                        callback("Error is fetch emails", {
                            data: {
                                id: 1,
                                labelIds: ['UNREAD'],
                                payload: {
                                    parts: [{
                                        body: {
                                            data: "Test"
                                        }
                                    }],
                                    headers: [{
                                        name: "Date",
                                        value: new Date()
                                    },
                                    {
                                        name: "Subject",
                                        value: "Test"
                                    },
                                    {
                                        name: "From",
                                        value: "tset@test.com"
                                    },
                                    {
                                        name: "Reply-To",
                                        value: "tset@test.com"
                                    },
                                    {
                                        name: "Cc",
                                        value: "tset@test.com"
                                    }
                                    ]
                                }
                            }
                        })
                    }
                }
            }
        }, 1);
        email.should.be.a('string');
    })


})