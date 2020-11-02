const chai = require('chai');
const chaiHttp = require('chai-http');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const server = require('../../app');
const OutlookService = require("./../../services/OutlookService");
const GoogleService = require("./../../services/GoogleService");
const expect = chai.expect;

const should = chai.should();
const modelName = 'emails';
chai.use(chaiHttp);

let token, loggedInUser, roleBody, setBody, userBody, leadBody, salesStageBody, lastSentEmail, trackingCode;

afterEach(() => {
    let key;
    for (key in this) {
        delete this[key];
    };
});

const emailGoogleData = [{
        email_provider_id: 1,
        email_user_name: 'rippletest6@gmail.com',
        email_user_password: 'RIPPLe3D1!',
        email_host: 'smtp.gmail.com',
        email_port: 587,
        use_ssl: false,
        type: "SMTP"
    },
    {
        email_provider_id: 1,
        email_user_name: 'rippletest6@gmail.com',
        email_user_password: 'RIPPLe3D1!',
        use_ssl: false,
        email_host: 'imap.gmail.com',
        email_port: 993,
        type: "IMAP"
    }
]

const emailOutlookData = [{
        email_provider_id: 1,
        email_user_name: 'pswebsitedesign@hotmail.com',
        email_user_password: 'RIPPLe3D1!',
        email_host: 'smtp-mail.outlook.com',
        email_port: 587,
        use_ssl: false,
        type: "SMTP"
    },
    {
        email_provider_id: 1,
        email_user_name: 'pswebsitedesign@hotmail.com',
        email_user_password: 'RIPPLe3D1!',
        use_ssl: false,
        email_host: 'imap-mail.outlook.com',
        email_port: 993,
        type: "IMAP"
    }
];

let emailProviders = [{
        id: 1,
        email_provider_name: 'Other Provider'
    },
    {
        id: 2,
        email_provider_name: 'Gmail'
    },
    {
        id: 3,
        email_provider_name: 'Outlook'
    }
]

let email = {
    to: [{
        email: 'pswebsitedesign@hotmail.com'
    }],
    cc: [{
        email: 'devraj.v@cisinlabs.com'
    }],
    bcc: [{
        email: 'gaurav.pwd@cisinlabs.com'
    }],
    attachment: [{
        file_name: 'test.txt',
        file_content: 'dGVzdA=='
    }, {
        file_name: 'test.txt',
        isMedia: true,
        file_content: 'test'
    }],
    message: "Hello, <br> This is testing email it sent from test cases. Kindly ignore it.",
    subject: "Test email sent from test cases",
};

let googleSampleMail = [{
    "id": "171c15af3bc74d9c",
    "threadId": "171c15a901c69bf6",
    "labelIds": [
        "SENT"
    ],
    "snippet": "Hello, This is testing email it sent from test cases. Kindly ignore it.",
    "historyId": "20132",
    "internalDate": "1588086881000",
    "payload": {
        "partId": "",
        "mimeType": "multipart/mixed",
        "filename": "",
        "headers": [{
                "name": "Return-Path",
                "value": "\u003crippletest6@gmail.com\u003e"
            },
            {
                "name": "Received",
                "value": "from [127.0.0.1] ([42.106.208.82])        by smtp.gmail.com with ESMTPSA id u13sm13160459pgf.10.2020.04.28.08.14.53        (version=TLS1_2 cipher=AES128-SHA bits=128/128);        Tue, 28 Apr 2020 08:14:55 -0700 (PDT)"
            },
            {
                "name": "Content-Type",
                "value": "multipart/mixed; boundary=\"--_NmP-6d5976bc1ff11e4b-Part_1\""
            },
            {
                "name": "From",
                "value": "rippletest6@gmail.com"
            },
            {
                "name": "To",
                "value": "pswebsitedesign@hotmail.com"
            },
            {
                "name": "Cc",
                "value": "devraj.v@cisinlabs.com"
            },
            {
                "name": "References",
                "value": "\u003c1588086864422@ripple.com\u003e"
            },
            {
                "name": "Subject",
                "value": "Test email sent from test cases"
            },
            {
                "name": "Message-ID",
                "value": "\u003c1588086881652@ripple.com\u003e"
            },
            {
                "name": "Date",
                "value": "Tue, 28 Apr 2020 15:14:41 +0000"
            },
            {
                "name": "MIME-Version",
                "value": "1.0"
            }
        ],
        "body": {
            "size": 0
        },
        "parts": [{
                "partId": "0",
                "mimeType": "multipart/alternative",
                "filename": "",
                "headers": [{
                    "name": "Content-Type",
                    "value": "multipart/alternative; boundary=\"--_NmP-6d5976bc1ff11e4b-Part_2\""
                }],
                "body": {
                    "size": 0
                },
                "parts": [{
                        "partId": "0.0",
                        "mimeType": "text/plain",
                        "filename": "",
                        "headers": [{
                                "name": "Content-Type",
                                "value": "text/plain"
                            },
                            {
                                "name": "Content-Transfer-Encoding",
                                "value": "quoted-printable"
                            }
                        ],
                        "body": {
                            "size": 166,
                            "data": "SGVsbG8sIDxicj4gVGhpcyBpcyB0ZXN0aW5nIGVtYWlsIGl0IHNlbnQgZnJvbSB0ZXN0IGNhc2VzLiBLaW5kbHkgaWdub3JlIGl0LiA8aW1nIHNyYz0iaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS9tYWlsZXIvNzM5OGNjMTc2ODIyMWRhNDlkMzNmMzgwYmY2OTZkZGIvdHJhY2tlci5wbmciPg=="
                        }
                    },
                    {
                        "partId": "0.1",
                        "mimeType": "text/html",
                        "filename": "",
                        "headers": [{
                                "name": "Content-Type",
                                "value": "text/html"
                            },
                            {
                                "name": "Content-Transfer-Encoding",
                                "value": "quoted-printable"
                            }
                        ],
                        "body": {
                            "size": 166,
                            "data": "SGVsbG8sIDxicj4gVGhpcyBpcyB0ZXN0aW5nIGVtYWlsIGl0IHNlbnQgZnJvbSB0ZXN0IGNhc2VzLiBLaW5kbHkgaWdub3JlIGl0LiA8aW1nIHNyYz0iaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS9tYWlsZXIvNzM5OGNjMTc2ODIyMWRhNDlkMzNmMzgwYmY2OTZkZGIvdHJhY2tlci5wbmciPg=="
                        }
                    }
                ]
            },
            {
                "partId": "1",
                "mimeType": "text/plain",
                "filename": "test.txt",
                "headers": [{
                        "name": "Content-Type",
                        "value": "text/plain; name=test.txt"
                    },
                    {
                        "name": "Content-Transfer-Encoding",
                        "value": "base64"
                    },
                    {
                        "name": "Content-Disposition",
                        "value": "attachment; filename=test.txt"
                    }
                ],
                "body": {
                    "attachmentId": "ANGjdJ-6KVa7-OLOhTeWi88WOFAEhjbwLzJbnX1xN47YLkZKSer8dYyqdoHxFsbkcFtO9NU6j1NH6i2wHHZsTMfCDcNVQYzPHdLB6EflBm4AmavdQodyXDWHhJu4rk5tAoOWp9ICXLkemYMK_doSFfiY9q2GD-FmtgEd2Ijq-ANa36fLcm67EhQSBq1DBVCQ6pDJRzEESH3h0lCiyw5HUcmfqyhYLklquPbBuIKY5bPPPM_sB6v0bvTyoSbEmZzmlzaQuxEQxbj_OCQIb1VE4m8iPuSFEfLRSvUpTN1n0LVteCeq_yf52xJgJN4neZNk_f0EXlwuhWRmBy16CNgcLpD5Vxxzbt0WIHgaP6hOyLwxD8HBEpVE_0lnoAREkkQMe4mjwlOge8NlZiee3CxC",
                    "size": 4
                }
            },
            {
                "partId": "2",
                "mimeType": "text/plain",
                "filename": "test.txt",
                "headers": [{
                        "name": "Content-Type",
                        "value": "text/plain; name=test.txt"
                    },
                    {
                        "name": "Content-Transfer-Encoding",
                        "value": "base64"
                    },
                    {
                        "name": "Content-Disposition",
                        "value": "attachment; filename=test.txt"
                    }
                ],
                "body": {
                    "size": 0,
                    "data": ""
                }
            }
        ]
    },
    "sizeEstimate": 1715
}];

let sampleOutlookMail = [{
    "@odata.etag": "W/\"CQAAABYAAABfZbgDY5O3RKvc3znvKjB2AARHzX6h\"",
    "id": "AQMkADAwATY3ZmYAZS1jNzZkLThiNGUtMDACLTAwCgBGAAADlarhUGoTAkeZ8RiBlku8hwcAX2W4A2OTt0Sr3N857yowdgAAAgEJAAAAX2W4A2OTt0Sr3N857yowdgAER9buXAAAAA==",
    "createdDateTime": "2020-04-29T09:11:22Z",
    "lastModifiedDateTime": "2020-04-29T09:11:23Z",
    "changeKey": "CQAAABYAAABfZbgDY5O3RKvc3znvKjB2AARHzX6h",
    "categories": [],
    "receivedDateTime": "2020-04-29T09:11:23Z",
    "sentDateTime": "2020-04-29T09:11:23Z",
    "hasAttachments": true,
    "internetMessageId": "<HE1PR0501MB27464300B7A1881000DB0F74A5AD0@HE1PR0501MB2746.eurprd05.prod.outlook.com>",
    "subject": "my tesy",
    "bodyPreview": "ttt",
    "importance": "normal",
    "parentFolderId": "AQMkADAwATY3ZmYAZS1jNzZkLThiNGUtMDACLTAwCgAuAAADlarhUGoTAkeZ8RiBlku8hwEAX2W4A2OTt0Sr3N857yowdgAAAgEJAAAA",
    "conversationId": "AQQkADAwATY3ZmYAZS1jNzZkLThiNGUtMDACLTAwCgAQAHq3lJEQEoFCuuF_bT04D3Y=",
    "conversationIndex": "AQHWHgYnereUkRASgUK64X5tPTgPdg==",
    "isDeliveryReceiptRequested": false,
    "isReadReceiptRequested": false,
    "isRead": true,
    "isDraft": false,
    "webLink": "https://outlook.live.com/owa/?ItemID=AQMkADAwATY3ZmYAZS1jNzZkLThiNGUtMDACLTAwCgBGAAADlarhUGoTAkeZ8RiBlku8hwcAX2W4A2OTt0Sr3N857yowdgAAAgEJAAAAX2W4A2OTt0Sr3N857yowdgAER9buXAAAAA%3D%3D&exvsurl=1&viewmodel=ReadMessageItem",
    "inferenceClassification": "focused",
    "body": {
        "contentType": "html",
        "content": "<html>\r\n<head>\r\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\r\n<meta content=\"text/html; charset=us-ascii\">\r\n</head>\r\n<body>\r\n<p>ttt</p>\r\n<div style=\"left:0; bottom:0\"><img class=\"ep_main_image lazyloaded\" width=\"100%\" alt=\"Bease Fox - with an animated gif logo\" src=\"https://www.mail-signatures.com/wp-content/uploads/2019/08/Fox-gif.gif\">\r\n</div>\r\n<img src=\"http://localhost:3000/api/mailer/690c026432468615084616f1d11f30cd/tracker.png\">\r\n</body>\r\n</html>\r\n"
    },
    "sender": {
        "emailAddress": {
            "name": "PS Website Design",
            "address": "pswebsitedesign@hotmail.com"
        }
    },
    "from": {
        "emailAddress": {
            "name": "PS Website Design",
            "address": "pswebsitedesign@hotmail.com"
        }
    },
    "toRecipients": [{
        "emailAddress": {
            "name": "rippletest6@gmail.com",
            "address": "rippletest6@gmail.com"
        }
    }],
    "ccRecipients": [],
    "bccRecipients": [],
    "replyTo": [],
    "flag": {
        "flagStatus": "notFlagged"
    }
}];

describe('EmailSyncs', () => {
    describe('/POST Login EmailSyncs', () => {
        before((done) => {
            commonFunction.sequalizedDb(["notes", "histories", "leads_clients", "users", "user_roles", "permission_sets", "sales_stages", "tasks", "todos"]).then(() => {
                userRoles = generatedSampleData.createdSampleData("user_roles", 1);
                commonFunction.clearTable("notifications").then(() => {
                    commonFunction.addDataToTable("user_roles", userRoles[0]).then((data) => {
                        roleBody = data
                        permissionSet = generatedSampleData.createdSampleData("permission_sets", 1);
                        commonFunction.addDataToTable("permission_sets", permissionSet[0]).then((data) => {
                            setBody = data;
                            user = generatedSampleData.createdSampleData("users", 1);
                            user[0].role_id = roleBody.id;
                            user[0].permission_set_id = setBody.id;
                            commonFunction.addDataToTable("users", user[0]).then((data) => {
                                userBody = data;
                                sales = generatedSampleData.createdSampleData("sales_stages", 1);
                                sales[0].user_id = userBody.id;
                                commonFunction.addDataToTable("sales_stages", sales[0]).then((data) => {
                                    salesStageBody = data;
                                    leadBody = generatedSampleData.createdSampleData("leads_clients", 1);
                                    leadBody[0].sales_stage_id = salesStageBody.id;
                                    leadBody[0].user_id = userBody.id;
                                    commonFunction.addDataToTable("leads_clients", leadBody[0]).then((data) => {
                                        leadBody = data;
                                        contacts = generatedSampleData.createdSampleData("contacts", 1);
                                        contacts[0].entity_id = leadBody.id;
                                        contacts[0].entity_type = "LEAD_CLIENT";
                                        commonFunction.addDataToTable("contacts", contacts[0]).then((data) => {
                                            contactBody = data;
                                            commonFunction.clearTable("email_providers").then(() => {
                                                commonFunction.addBulkDataToTable("email_providers", emailProviders).then((data) => {
                                                    commonFunction.clearTable("emails").then(() => {
                                                        done();
                                                    })
                                                });
                                            })
                                        });
                                    });
                                });
                            });
                        })
                    });
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
                    token = res.body.token;
                    loggedInUser = res.body.user;
                    res.body.user.should.be.a('object');
                    res.body.user.first_name.should.be.eql(user[0].first_name);
                    res.body.user.last_name.should.be.eql(user[0].last_name);
                    res.body.user.email.should.be.eql(user[0].email);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });



        describe('/POST Email Sync And Send By Google Other Provider', () => {
            before((done) => {
                commonFunction.clearTable("email_users").then(() => {
                    emailGoogleData[0].user_id = loggedInUser.id;
                    emailGoogleData[1].user_id = loggedInUser.id;
                    commonFunction.addBulkDataToTable("email_users", emailGoogleData).then((data) => {
                        done();
                    })
                })
            });

            it('To get email user details', () => {
                email.lead_id = leadBody.id;
                return chai.request(server)
                    .post('/api/getEmailUsers')
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To send email with attachment', () => {
                email.lead_id = leadBody.id;
                return chai.request(server)
                    .post('/api/mailer/sendTrackableMail')
                    .set({ Authorization: token })
                    .send(email)
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.message.should.be.a('string');

                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To fetch email thread from server by lead id', () => {
                return chai.request(server)
                    .get('/api/leadHistory/' + leadBody.id)
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.history.should.be.a('array');
                        lastSentEmail = res.body.history[0].object[0];
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To send reply email with attachment', () => {
                email.lead_id = leadBody.id;
                email.id = lastSentEmail.id;
                email.conversation_id = lastSentEmail.conversation_id;
                return chai.request(server)
                    .post('/api/mailer/sendTrackableMail')
                    .set({ Authorization: token })
                    .send(email)
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.message.should.be.a('string');

                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To download attachment of email', () => {
                return chai.request(server)
                    .post('/api/mailer/downloadAttachment')
                    .set({ Authorization: token })
                    .send({ id: lastSentEmail.attachments[0].id, email_id: lastSentEmail.id })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.contentBytes.should.be.a('string');
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });

            })
        })


        describe('/POST Email Sync And Send By Outlook Other Provider', () => {
            before((done) => {
                commonFunction.clearTable("email_users").then(() => {
                    emailOutlookData[0].user_id = loggedInUser.id;
                    emailOutlookData[1].user_id = loggedInUser.id;
                    commonFunction.addBulkDataToTable("email_users", emailOutlookData).then((data) => {
                        commonFunction.clearTable("emails").then(() => {
                            done();
                        })
                    })
                })
            });

            it('To get email user details', () => {
                return chai.request(server)
                    .get('/api/getEmailUsers')
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To send email with attachment', () => {
                email.lead_id = leadBody.id;
                return chai.request(server)
                    .post('/api/mailer/sendTrackableMail')
                    .set({ Authorization: token })
                    .send(email)
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.message.should.be.a('string');

                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            // it('To fetch email thread from server by lead id', () => {
            //     return chai.request(server)
            //         .get('/api/leadHistory/' + leadBody.id)
            //         .set({ Authorization: token })
            //         .then((res) => {
            //             res.should.have.status(200);
            //             res.body.should.be.a('object');
            //             res.body.history.should.be.a('array');
            //             lastSentEmail = res.body.history[0].object[0];
            //         }).catch(function(err) {
            //             return Promise.reject(err);
            //         });
            // });

            it('To send reply email with attachment', () => {
                email.lead_id = leadBody.id;
                email.id = lastSentEmail.id;
                email.conversation_id = lastSentEmail.conversation_id;
                return chai.request(server)
                    .post('/api/mailer/sendTrackableMail')
                    .set({ Authorization: token })
                    .send(email)
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.message.should.be.a('string');

                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To download attachment of email', () => {
                return chai.request(server)
                    .post('/api/mailer/downloadAttachment')
                    .set({ Authorization: token })
                    .send({ id: 2, email_id: lastSentEmail.id })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.contentBytes.should.be.a('string');
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            })

            it('To call track basic detail api', () => {
                if (lastSentEmail.body)
                    trackingCode = lastSentEmail.body.substring(
                        lastSentEmail.body.lastIndexOf("mailer/") + 1,
                        lastSentEmail.body.lastIndexOf("/tracker.png")
                    );
                return chai.request(server)
                    .get('/api/m' + trackingCode + "/tracker.png")
                    .then((res) => {
                        res.should.have.status(200);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To fetch email thread from server by lead id with tracking details', () => {
                return chai.request(server)
                    .get('/api/leadHistory/' + leadBody.id)
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.history.should.be.a('array');
                        lastSentEmail = res.body.history[0].object[0];
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });
        })


        describe("/Post Email sync and send using outlook o'auth", () => {
            before((done) => {
                commonFunction.clearTable("email_users").then(() => {
                    commonFunction.addDataToTable("email_users", {
                        email_user_name: 'pswebsitedesign@hotmail.com',
                        email_provider_id: 3,
                        user_id: loggedInUser.id
                    }).then((data) => {
                        commonFunction.clearTable("mailer_tokens").then(() => {
                            commonFunction.addDataToTable("mailer_tokens", {
                                email_user: 'pswebsitedesign@hotmail.com',
                                mailer_token: 'ya29.GlwLB3TqDshn6bGhaOxbGuDTotMZFF30m5sRhJdpqozLVPuIWV2z0qMgBBX6kPOVPNK-P_8RLQaiarOVd_p3VPEQhERd7Ss5aRvz3gg1RpoOnGpU-HRpQQeJDKOqEA',
                                status: 'done',
                                mailer_token_id: 3,
                                user_id: loggedInUser.id
                            }).then(() => {
                                OutlookService.init();
                                done();
                            })
                        })
                    })
                })
            });

            it('To get email user for outlook details', () => {
                return chai.request(server)
                    .get('/api/getEmailUsers')
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To send email with attachment', () => {
                email.lead_id = leadBody.id;
                return chai.request(server)
                    .post('/api/mailer/sendTrackableMail')
                    .set({ Authorization: token })
                    .send(email)
                    .then((res) => {
                        res.should.have.status(422);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To fetch email thread from server by lead id', () => {
                return chai.request(server)
                    .get('/api/leadHistory/' + leadBody.id)
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To send reply email with attachment', () => {
                email.lead_id = leadBody.id;
                email.id = lastSentEmail.id;
                email.conversation_id = lastSentEmail.conversation_id;
                return chai.request(server)
                    .post('/api/mailer/sendTrackableMail')
                    .set({ Authorization: token })
                    .send(email)
                    .then((res) => {
                        res.should.have.status(422);;

                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To download attachment of email', () => {
                return chai.request(server)
                    .post('/api/mailer/downloadAttachment')
                    .set({ Authorization: token })
                    .send({ id: 2, email_id: lastSentEmail.id })
                    .then((res) => {
                        res.should.have.status(422);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            })

            it('To call track basic detail api', () => {
                if (lastSentEmail.body)
                    trackingCode = lastSentEmail.body.substring(
                        lastSentEmail.body.lastIndexOf("mailer/") + 1,
                        lastSentEmail.body.lastIndexOf("/tracker.png")
                    );
                return chai.request(server)
                    .get('/api/m' + trackingCode + "/tracker.png")
                    .then((res) => {
                        res.should.have.status(200);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To fetch email thread from server by lead id with tracking details', () => {
                return chai.request(server)
                    .get('/api/leadHistory/' + leadBody.id)
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To fetch email by direct outlook service', async () => {
                let [err, emails] = await OutlookService.fetchEmail('testId');
                expect(err).be.a('object');
                expect(emails).be.a('null');
            })

            it('To download email attachment by direct outlook service', async () => {
                let [err, emails] = await OutlookService.downloadAttachment(1, 2);
                expect(err).be.a('object');
                expect(emails).be.a('null');
            })

            it('To get email tracking details by direct outlook service', async () => {
                let email = await OutlookService.getEmailTrackingDetails(1);
                expect(email).be.a('undefined');
            })

            it('To get single mail by outlook service direct', async () => {
                let emails = await OutlookService.manageEmails(sampleOutlookMail);
                expect(emails).be.a('array');
            })

        });

        describe("/Post Email sync and send using outlook o'auth", () => {
            before((done) => {
                commonFunction.clearTable("email_users").then(() => {
                    commonFunction.addDataToTable("email_users", {
                        email_user_name: 'rippletest6@gmail.com',
                        email_provider_id: 2,
                        user_id: loggedInUser.id
                    }).then((data) => {
                        commonFunction.clearTable("mailer_tokens").then(() => {
                            commonFunction.addDataToTable("mailer_tokens", {
                                email_user: 'rippletest6@gmail.com',
                                mailer_token: 'ya29.GlwMB-lsFeIGaxy3lwaPdWYQMqyF',
                                status: 'pending',
                                mailer_token_id: 2,
                                user_id: loggedInUser.id
                            }).then(() => {
                                GoogleService.init();
                                done();
                            })
                        })
                    })
                })
            });

            it('To get email user for outlook details', () => {
                return chai.request(server)
                    .get('/api/getEmailUsers')
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To send email with attachment', () => {
                email.lead_id = leadBody.id;
                return chai.request(server)
                    .post('/api/mailer/sendTrackableMail')
                    .set({ Authorization: token })
                    .send(email)
                    .then((res) => {
                        res.should.have.status(422);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To fetch email thread from server by lead id', () => {
                return chai.request(server)
                    .get('/api/leadHistory/' + leadBody.id)
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To send reply email with attachment', () => {
                email.lead_id = leadBody.id;
                email.id = lastSentEmail.id;
                email.conversation_id = lastSentEmail.conversation_id;
                return chai.request(server)
                    .post('/api/mailer/sendTrackableMail')
                    .set({ Authorization: token })
                    .send(email)
                    .then((res) => {
                        res.should.have.status(422);;

                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To download attachment of email', () => {
                return chai.request(server)
                    .post('/api/mailer/downloadAttachment')
                    .set({ Authorization: token })
                    .send({ id: 2, email_id: lastSentEmail.id })
                    .then((res) => {
                        res.should.have.status(422);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            })

            it('To call track basic detail api', () => {
                if (lastSentEmail.body)
                    trackingCode = lastSentEmail.body.substring(
                        lastSentEmail.body.lastIndexOf("mailer/") + 1,
                        lastSentEmail.body.lastIndexOf("/tracker.png")
                    );
                return chai.request(server)
                    .get('/api/m' + trackingCode + "/tracker.png")
                    .then((res) => {
                        res.should.have.status(200);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To fetch email thread from server by lead id with tracking details', () => {
                return chai.request(server)
                    .get('/api/leadHistory/' + leadBody.id)
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                    }).catch(function(err) {
                        return Promise.reject(err);
                    });
            });

            it('To send email by direct google service', async () => {
                let [err, emails] = await GoogleService.sendEmail(email);
                expect(err).be.a('object');
            })

            it('To get email  user details by direct google service', async () => {
                let [err, emails] = await GoogleService.getUserDetails();
                expect(err).be.a('object');
            })

            it('To get single mail by google direct', async () => {
                let emails = await GoogleService.manageEmails(googleSampleMail);
                expect(emails).be.a('array');
            })
        });

        after((done) => {
            commonFunction.clearTable("notifications").then(() => {
                commonFunction.clearTable("contacts").then(() => {
                    commonFunction.clearTable("leads_clients").then(() => {
                        done();
                    });
                });
            });
        });

    });
});