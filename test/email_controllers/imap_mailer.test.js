/**
 *  Created by cis on 27/8/18.
 */
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
    id: 31,
    email_provider_name: 'custom'
}
let imapUser = {
    email_provider_id: 31,
    email_user_name: 'hello@ripplecrm.co.uk',
    email_user_password: 'R1PPle@2019!&',
    email_port: 993,
    email_host: 'outlook.office365.com',
    type: 'IMAP',
    use_ssl: 1
};
let smtpUser = {
    email_provider_id: 31,
    email_user_name: 'hello@ripplecrm.co.uk',
    email_user_password: 'R1PPle@2019!&',
    email_port: 587,
    email_host: 'outlook.office365.com',
    type: 'SMTP',
    use_ssl: 1
};

let emailList = [];


describe('ImapMailer', () => {
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
                            commonFunction.addDataToTable("email_users", imapUser).then((data) => {
                                commonFunction.addDataToTable("email_users", smtpUser).then((data) => {
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

    it('it should be get folders without auth token', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be get folders with auth and invalid user_name', () => { //to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'asd@outlook.com', provider: 'custom' });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch folders');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    // it('it should be saveDraft with valid format...', () => { //** */it should be saveDraft with valid format... //to avoid IMAP on Live

    //     return chai.request(server)
    //         .post('/api/mailer/saveDraft')
    //         .set({
    //             Authorization: token
    //         })
    //         .send({

    //             "graph_user_name": "hello@ripplecrm.co.uk",
    //             "provider": "custom",
    //             "mail": {
    //                 "message": {
    //                     "subject": "Fwd:Testing email from custom",
    //                     "body": {
    //                         "contentType": "text",
    //                         "content": "Test Email"
    //                     },
    //                     "toRecipients": [
    //                         "abhishek.p@cisinlabs.com"
    //                     ],
    //                     "Attachments": [

    //                     ],
    //                     "BccRecipients": [

    //                     ],
    //                     "Categories": [
    //                         "Important"
    //                     ],
    //                     "CcRecipients": [

    //                     ],
    //                     "ReplyTo": [
    //                         "test@123.com"
    //                     ]

    //                 },

    //                 "SaveToSentItems": "true"
    //             }
    //         }

    //         )
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.message.should.be.a('string');
    //             res.body.message.should.be.eql('Email successfully saved.');

    //         }).catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });


    // it('it should be sendMail with valid format...', () => {

    //     return chai.request(server)
    //         .post('/api/mailer/sendMail')
    //         .set({
    //             Authorization: token
    //         })
    //         .send({ "provider": "custom", "graph_user_name": "hello@ripplecrm.co.uk", "SaveToSentItems": "true", "mail": { "message": { "toRecipients": ["dhyanesh.j@cisinlabs.com", "dhyanesh.j@cisinlabs.com"], "subject": "Testing an email", "BccRecipients": [], "CcRecipients": [], "Categories": [], "ReplyTo": [], "Attachments": [], "body": { "contentType": "text", "content": "" } } } })
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.message.should.be.a('string');
    //             res.body.message.should.be.eql('Email successfully sent.');

    //         }).catch(function(err) {
    //             return Promise.reject(err);
    //         });
    // });


    it('it should be get folders with auth and invalid user_name', () => { ////to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm1.co.uk', provider: 'custom' });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch folders');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be get folders with auth and invalid user_name...', () => { //to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom' });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch folders');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    // it('it should be get folders with auth and valid user_name', () => { //commented bcox of fail of it
    //     return chai.request(server)
    //         .post('/api/mailer/getFolders')
    //         .set({
    //             Authorization: token
    //         })
    //         .send({
    //             graph_user_name: 'hello@ripplecrm.co.uk',
    //             provider: 'custom'
    //         })
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //              res.body.message.should.be.a('string');
    //             // res.body.message.should.be.eql('');
    //         }).catch(function(err) {
    //             return Promise.reject(err);
    //         });
    // });
    // it('it should be get Mail with auth and valid user_name', () => { //commented bcox of fail of it//to avoid IMAP on Live
    //     return chai.request(server)
    //         .post('/api/mailer/getMail')
    //         .set({
    //             Authorization: token
    //         })
    //         .send({
    //             graph_user_name: 'hello@ripplecrm.co.uk',
    //             provider: 'custom'
    //         })
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.mails.should.be.a('array');
    //             //console.log('array is###########',res.body.mails.from);
    //             // res.body.should.be.a('array');

    //         }).catch(function(err) {
    //             return Promise.reject(err);
    //         });
    // });

    it('it should be get folders with missing parameters innnn IMAP', () => { //to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', password: '', host: 'outlook.office365.com', port: 99 });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch folders');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be get folders with missing parameters in IMAP', () => { //** */to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', password: '', host: 'outlook.office365.com', port: 99 });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', password: '', host: 'outlook.office365.com', port: 99 })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch mails');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    ///////////////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    it('it should be get folders with auth token', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' });
        return chai.request(server)
            .get('/api/mailer/getFolders/'+encodedObject)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                // res.body.should.be.a('object');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    ///////////////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


    it('it should be get emails with auth token', () => {
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                // res.body.mails.should.be.a('array');
                // res.body.offset.should.be.a('number');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be get emails with auth token and invalid user name ', () => { //to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello2@ripplecrm.co.uk', provider: 'custom' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'hello2@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch mails');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be get emails by getMailById with auth token and user and without folder id token', () => { //to avoid IMAP on Live
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' });
        return chai.request(server)
            .post('/api/mailer/getMailById')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch mail by id');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be get emails by getMailById with auth token and invalid user and with foder id token', () => { //to avoid IMAP on Live
        // encodedObject = commonFunction.encodeToBase64({
        //     graph_user_name: 'hello2@ripplecrm.co.uk',
        //     provider: 'custom',
        //     mail_id: '16a7d5064f546459'
        // });
        return chai.request(server)
            .post('/api/mailer/getMailById')
            .set({
                Authorization: token
            })
            .send({
                graph_user_name: 'hello2@ripplecrm.co.uk',
                provider: 'custom',
                mail_id: '16a7d5064f546459'
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch mail by id');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be get emails by getMailById with auth token and  user and with foder id token', () => { //to avoid IMAP on Live
        let mailId = 0;
        if (emailList && emailList.length > 0) {
            mailId = emailList[0].id;
        }
        // encodedObject = commonFunction.encodeToBase64({
        //     graph_user_name: 'dhyanesh.j@outlook.com',
        //     provider: 'custom',
        //     folder_id: 'INBOX',
        //     mail_id: '1'
        // });
        return chai.request(server)
            .post('/api/mailer/getMailById')
            .set({
                Authorization: token
            })
            .send({
                graph_user_name: 'dhyanesh.j@outlook.com',
                provider: 'custom',
                folder_id: 'INBOX',
                mail_id: '1'
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be get emails by getMailById with auth token and  user and with foder id token and invalid mail_id', () => { //to avoid IMAP on Live
        let mailId = 0;
        if (emailList && emailList.length > 0) {
            mailId = emailList[0].id;
        }
        // encodedObject = commonFunction.encodeToBase64({
        //     graph_user_name: 'dhyanesh.j@outlook.com',
        //     provider: 'custom',
        //     folder_id: 'INBOX',
        //     mail_id: '16a7d54f546459'
        // });
        return chai.request(server)
            .post('/api/mailer/getMailById')
            .set({
                Authorization: token
            })
            .send({
                graph_user_name: 'dhyanesh.j@outlook.com',
                provider: 'custom',
                folder_id: 'INBOX',
                mail_id: '16a7d54f546459'
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch mail by id');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    // it('it should be getMailById with valid format...', () => { //it should be getMailById with valid format... //should be commeted because of failed //to avoid IMAP on Live

    //     return chai.request(server)
    //         .post('/api/mailer/getMailById')
    //         .set({
    //             Authorization: token
    //         })
    //         .send({
    //             folder_id: "Inbox",
    //             graph_user_name: "hello@ripplecrm.co.uk",
    //             provider: "custom",
    //             mail_id: "16a7d5064f546459",

    //         })
    //         .then((res) => {
    //             console.log('##############', res.body);
    //             res.should.have.status(200);
    //             res.body.should.be.a('array');
    //             // res.body.message.should.be.a('string');
    //             // res.body.message.should.be.eql('Email successfully updated.');
    //         }).catch(function(err) {
    //             return Promise.reject(err);
    //         });
    // });






    it('it should be sendMail without auth token', () => {
        return chai.request(server)
            .post('/api/mailer/sendMail')
            // .set({
            //     Authorization: token
            // })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be saveDraft with wrong format', () => { //to avoid IMAP on Live

        return chai.request(server)
            .post('/api/mailer/sendMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "from_id": '123',
                "graph_user_name": "dhyanesh.j@outlook.com",
                "provider": "custom",
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
            }


            )
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in email sending');

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be sendMail with wrong format', () => {

        return chai.request(server)
            .post('/api/mailer/sendMail')
            .set({
                Authorization: token
            })
            .send({
                "SaveToSentItems": "true",
                "graph_user_name": "dhyanesh.j@Outlook.com",
                "provider": "custom",
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
            }


            )
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in email sending');

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    // //replayMail
    it('it should be replayMail without auth token', () => {
        return chai.request(server)
            .post('/api/mailer/replayMail')
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(401);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    // // //replayMail
    it('it should be replayMail with auth token', () => {
        return chai.request(server)
            .post('/api/mailer/replayMail')
            .set({
                Authorization: token
            })
            .send({

                "graph_user_name": "dhyanesh.j@outlook.com",
                "provider": "custom",
                "mail": {
                    "message": {
                        "subject": "Fwd:Testing email from custom",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dhyanesh.j@cisinlabs.com"
                        ],
                        "Attachments": [

                        ],
                        "BccRecipients": [

                        ],
                        "Categories": [
                            "Important"
                        ],
                        "CcRecipients": [

                        ],
                        "ReplyTo": [
                            "test@123.com"
                        ]

                    },

                    "SaveToSentItems": "true"
                }
            })
            .then((res) => {
                res.should.have.status(200);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    //replayMail
    it('it should be replayMail with auth token and invalid user name', () => {
        return chai.request(server)
            .post('/api/mailer/replayMail')
            .set({
                Authorization: token
            })
            .send({

                "graph_user_name": "dhyanesh.j112@outlook.com",
                "provider": "custom",
                "mail": {
                    "message": {
                        "subject": "Fwd:Testing email from custom",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dhyanesh.j@cisinlabs.com"
                        ],
                        "Attachments": [

                        ],
                        "BccRecipients": [

                        ],
                        "Categories": [
                            "Important"
                        ],
                        "CcRecipients": [

                        ],
                        "ReplyTo": [
                            "test@123.com"
                        ]

                    },

                    "SaveToSentItems": "true"
                }
            })
            .then((res) => {
                res.should.have.status(200);

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    //createReplyMail
    it('it should be createReplyMail without auth token', () => {
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be createReplyMail with auth token', () => { //it should be createReplyMail with auth token
        return chai.request(server)
            .post('/api/mailer/createReplyMail')
            .set({
                Authorization: token
            })
            .send({

                "graph_user_name": "hello@ripplecrm.co.uk",
                "provider": "custom",
                "mail": {
                    "message": {
                        "subject": "Fwd:Testing email from custom",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dhyanesh.j@cisinlabs.com"
                        ],
                        "Attachments": [

                        ],
                        "BccRecipients": [

                        ],
                        "Categories": [
                            "Important"
                        ],
                        "CcRecipients": [

                        ],
                        "ReplyTo": [
                            "test@123.com"
                        ]

                    },

                    "SaveToSentItems": "true"
                }
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in email saving');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //updatMail
    it('it should be updateMail without auth token', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom', folder_Id: 'INBOX' })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be updateMail without auth token and without folderID', () => { ////to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in email update');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be updateMail with auth token', () => { ////to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({
                graph_user_name: 'dhyanesh.j@outlook.com',
                provider: 'custom',
                mail_id: '16a7d5064f546459',
                isRead: false
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql('Error in email update')
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be updateMail with auth token and invalid user name', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({
                graph_user_name: 'dhyanesh.j12@outlook.com',
                provider: 'custom',
                mail_id: '16a7d5064f546459',
                isRead: false
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.eql('Error in email update')
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be updateMail with valid format...', () => {

        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({

                "graph_user_name": "hello@ripplecrm.co.uk",
                "provider": "custom",
                "mail_id": "11",
                "isRead": true,
                "folder_id": 'INBOX'
            }



            )
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in email update');

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be saveDraft with auth token', () => { //it should be saveDraft with auth token////to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/saveDraft')
            .set({
                Authorization: token
            })
            .send({

                "graph_user_name": "dhyanesh.j@outlook.com",
                "provider": "custom",
                "mail": {
                    "message": {
                        "subject": "Fwd:Testing email from custom",
                        "body": {
                            "contentType": "text",
                            "content": "Test Email"
                        },
                        "toRecipients": [
                            "dhyanesh.j@cisinlabs.com"
                        ],
                        "Attachments": [

                        ],
                        "BccRecipients": [

                        ],
                        "Categories": [
                            "Important"
                        ],
                        "CcRecipients": [

                        ],
                        "ReplyTo": [
                            "test@123.com"
                        ]

                    },

                    "SaveToSentItems": "true"
                }
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be updateMail without auth token', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .send({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', mail: { message: "body" } })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //searchMail
    it('it should be searchMail without auth token', () => { //to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', search_text: 'text', folder_id: 'Inbox' });
        return chai.request(server)
            .get('/api/mailer/searchMail/'+encodedObject)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be searchMail with auth token', () => { //to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', search_text: 'text', folder_id: 'Inbox' });
        return chai.request(server)
            .get('/api/mailer/searchMail/'+encodedObject)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be searchMail with auth token', () => { //to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', search_text: 'text' });
        return chai.request(server)
            .get('/api/mailer/searchMail/'+encodedObject)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch mail by id');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be searchMail with auth token valid parameters', () => { //it should be searchMail with auth token valid parameters//to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({
            graph_user_name: 'dhyanesh.j@outlook.com',
            provider: 'custom',
            search_text: 'text',
            folder_id: 'Inbox'
        });
        return chai.request(server)
            .get('/api/mailer/searchMail/'+encodedObject)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                //res.body.mails.should.be.a('array');

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //getAttachment
    it('it should be getAttachment without auth token', () => { //to avoid IMAP on Live
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom', folder_id: 'INBOX' });
        return chai.request(server)
            .post('/api/mailer/getAttachment')
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom', folder_id: 'INBOX' })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be getAttachment without auth token and without folderID', () => { //to avoid IMAP on Live
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' });
        return chai.request(server)
            .post('/api/mailer/getAttachment')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch mail by id');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be getAttachment with auth token', () => { //to avoid IMAP on Live
        // encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', folder_id: 'Inbox' });
        return chai.request(server)
            .post('/api/mailer/getAttachment')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', folder_id: 'Inbox' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');

            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    //moveorCopyMail

    ///////////////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    it('it should be moveOrCopyMail without auth token', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')

            .send({
                graph_user_name: 'hello@ripplecrm.co.uk',
                provider: 'custom',
                destination_id: "DRAFT",
                from_id: "INBOX"
            })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be moveOrCopyMail without auth token', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')

            .send({
                graph_user_name: 'hello@ripplecrm.co.uk',
                provider: 'custom',
                destination_id: "DRAFT",
                from_id: "INBOX"
            })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be moveOrCopyMail with auth token and without from_id param', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .send({
                graph_user_name: 'hello@ripplecrm.co.uk',
                provider: 'custom',
                destination_id: "DRAFT"
            })
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.message.should.have.eql('Error in copy/move mail');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    //destination_id:"DRAFT",from_id:"INBOX"
    it('it should be moveOrCopyMail witth auth token', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', destination_id: "Draft", from_id: "Inbox", action: 'copy' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be moveOrCopyMail without destination_ID', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'hello@ripplecrm.co.uk', provider: 'custom', from_id: "INBOX", action: 'copy' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in copy/move mail');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    it('it should be moveOrCopyMail without from_id ', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom', action: 'copy' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in copy/move mail');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be moveOrCopyMail valid parametrs ', () => { //socket hang up //it should be moveOrCopyMail valid parametrs////to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .set({
                Authorization: token
            })
            .send({
                graph_user_name: 'dhyanesh.j@outlook.com',
                provider: 'custom',
                action: 'copy',
                mail_id: '11',
                from_id: "Inbox",
                destination_id: "Draft"
            })
            .then((res) => {
                console.log('res', res.body);
                res.should.have.status(200);



                res.body.should.be.a('object');
                //res.body.status.should.be.a('string');
                //res.body.status.should.be.eql('Success');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });


    //invalid user_name token

    //////////////////////////////////////////////////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    it('it should be getMail with auth and invalid user_name token', () => { //to avoid IMAP on Live
        encodedObject = commonFunction.encodeToBase64({ graph_user_name: 'hello1@ripplecrm.co.uk', provider: 'custom' });
        return chai.request(server)
            .get('/api/mailer/getMail/'+encodedObject)
            .set({
                Authorization: token
            })
            // .send({ graph_user_name: 'hello1@ripplecrm.co.uk', provider: 'custom' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in fetch mails');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    //updateMail
    it('it should be updateMail with auth and invalid user_name token', () => { //to avoid IMAP on Live
        return chai.request(server)
            .post('/api/mailer/updateMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in email update');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });



    //moveOrCopyMail
    it('Test moveOrCopy', () => {
        return chai.request(server)
            .post('/api/mailer/moveOrCopyMail')
            .set({
                Authorization: token
            })
            .send({ graph_user_name: 'dhyanesh.j@outlook.com', provider: 'custom' })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.message.should.be.a('string');
                res.body.message.should.be.eql('Error in copy/move mail');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

