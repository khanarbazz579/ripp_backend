const GoogleAuthHelper = require("./../helpers/googleAuthHelper");
var base64 = require("../controllers/mailerController/base64Decoder").Base64;
const MailComposer = require('nodemailer/lib/mail-composer');
const multerS3UserProfile = require('./multerS3UserProfile');
const GoogleAuth = new GoogleAuthHelper();
const Emails = require('./../models').emails;
const EmailTrackingDetails = require('./../models').email_tracking_details;

module.exports = {
    client: {},

    async init(userName) {
        try {
            this.client = await GoogleAuth.getAccessToken(userName);
            if (!this.client) {
                return ["Invalid authentication, Kindly check authentication token is active."]
            }
            return [null, this];
        } catch (err) {
            return [err, null];
        }
    },

    async getUserDetails() {
        try {
            return new Promise((resolve) => {
                if (this.client && this.client.users) {
                    this.client.users.getProfile({
                        'userId': 'me'
                    }, (err, user) => {
                        if (err) return resolve([err]);
                        resolve([null,
                            {
                                username: user.data.emailAddress,
                                surname: '',
                                raw: JSON.stringify(user.data)
                            }
                        ])
                    })
                } else {
                    resolve([{ error: "Error in connection." }]);
                }

            })
        } catch (err) {
            return [err, null];
        }
    },

    async manageRecipient(body) {
        try {
            let tos = [];
            let cc = [];
            let bcc = [];
            if (body.to && body.to.length > 0) {
                for (let i = 0; i < body.to.length; i++) {
                    tos.push(body.to[i].email.trim())
                }
            }
            if (body.cc && body.cc.length > 0) {
                for (let i = 0; i < body.cc.length; i++) {
                    cc.push(body.cc[i].email.trim())
                }
            }
            if (body.bcc && body.bcc.length > 0) {
                for (let i = 0; i < body.bcc.length; i++) {
                    bcc.push(body.bcc[i].email.trim())
                }
            }
            return [tos, cc, bcc];
        } catch (err) {
            throw new Error(err);
        }
    },

    async manageAttachment(body) {
        try {
            let attachments = [];
            if (body && body.attachment && body.attachment.length > 0) {
                for (let i = 0; i < body.attachment.length; i++) {
                    let content = body.attachment[i].file_content;
                    if (body.attachment[i].isMedia) {
                        content = await multerS3UserProfile.getFileFromAWSForEmail(body.attachment[i].file_content);
                    }
                    attachments.push({
                        'encoding': 'base64',
                        'filename': body.attachment[i].file_name,
                        'content': content
                    })
                }
            }
            return attachments;
        } catch (e) {
            throw new Error(err);
        }
    },

    async sendEmail(body) {
        try {
            let [tos, cc, bcc] = await this.manageRecipient(body);
            let attachments = await this.manageAttachment(body);
            let mailData = {
                to: tos.join(),
                cc: cc.join(),
                Bcc: bcc.join(),
                text: body.message,
                html: body.message,
                subject: body.subject,
                textEncoding: "base64",
                attachments: attachments
            };
            return new Promise((resolve, reject) => {
                let composeMailObject = new MailComposer(mailData);
                composeMailObject.compile().build((err, msg) => {
                    if (err) throw new Error(err);
                    let message = Buffer.from(msg)
                        .toString('base64')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=+$/, '');
                    let resource = {
                        raw: message
                    };
                    if (body.conversation_id) {
                        resource.threadId = body.conversation_id;
                    }
                    if (this.client && this.client.users) {
                        this.client.users.messages.send({
                            userId: "me",
                            format: "RAW",
                            resource: resource
                        }, (err, result) => {
                            if (err) resolve([err, null]);
                            resolve([null, {
                                email_online_id: result.data.id,
                                conversation_id: result.data.threadId
                            }]);
                        });
                    } else {
                        resolve([{ error: "No connection available" }])
                    }

                });
            })
        } catch (err) {
            return [err, null]
        }
    },

    async fetchEmail(conversationId) {
        try {
            return new Promise((resolve, reject) => {
                this.client.users.threads.get({
                    userId: "me",
                    id: conversationId
                }, async (err, messages) => {
                    if (err) resolve([err, null]);
                    if (messages && messages.data && messages.data.messages) {
                        let managedEmails = await this.manageEmails(messages.data.messages);
                        resolve([null, managedEmails]);
                    } else {
                        resolve(['No email found', null]);
                    }
                })
            })
        } catch (err) {
            return [err, null];
        }
    },

    async manageEmails(emails) {
        try {
            let managedEmails = [];
            for (let i = 0; i < emails.length; i++) {
                let to = await this.getMessagePartFromHeaders(emails[i].payload.headers, 'To');
                let cc = await this.getMessagePartFromHeaders(emails[i].payload.headers, 'Cc');
                let bcc = await this.getMessagePartFromHeaders(emails[i].payload.headers, 'Bcc');
                let hasAttachments = false;
                let bodyData = await this.getBody(emails[i].payload);

                let email = {
                    id: emails[i].id,
                    conversation_id: emails[i].threadId,
                    created_at: await this.getMessagePartFromHeaders(emails[i].payload.headers, 'Date'),
                    received_at: await this.getMessagePartFromHeaders(emails[i].payload.headers, 'Date'),
                    sent_at: await this.getMessagePartFromHeaders(emails[i].payload.headers, 'Date'),
                    has_attachment: hasAttachments,
                    subject: await this.getMessagePartFromHeaders(emails[i].payload.headers, 'Subject'),
                    body_preview: emails[i].snippet,
                    is_draft: emails[i].labelIds.indexOf('DRAFT') > -1 ? true : false,
                    body: base64.decode(bodyData).replace('P {margin-top:0;margin-bottom:0;}', ''),
                    from: await this.getMessagePartFromHeaders(emails[i].payload.headers, 'From') + " < " + await this.getMessagePartFromHeaders(emails[i].payload.headers, 'From') + ">",
                    to: to.split(','),
                    cc: cc.split(','),
                    bcc: bcc.split(','),
                    reply_to: [],
                    attachments: await this.getAttachmentPart(emails[i].payload.parts),
                    raw: JSON.stringify(emails[i]),
                    tracking: await this.getEmailTrackingDetails(emails[i].id)
                };
                managedEmails.push(email);
            }
            return managedEmails;
        } catch (err) {
            throw new Error(err);
        }
    },

    async getBody(message) {
        var encodedBody = '';
        if (typeof message.parts === 'undefined') {
            encodedBody = message.body.data;
        } else {
            encodedBody = await this.getHTMLPart(message.parts);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        return encodedBody;
    },

    async getHTMLPart(arr) {
        for (var x = 0; x <= arr.length; x++) {
            if (typeof arr[x].parts === 'undefined') {
                if (arr[x].mimeType === 'text/html') {
                    return arr[x].body.data;
                }
            } else {
                return this.getHTMLPart(arr[x].parts);
            }
        }
        return '';
    },

    async getAttachmentPart(arr) {
        let attachments = [];
        for (var x = 0; x <= arr.length; x++) {
            if (arr[x] && typeof arr[x].parts === 'undefined') {
                if (arr[x].mimeType !== 'text/html' && arr[x].filename) {
                    attachments.push({
                        content_type: arr[x].mimeType,
                        name: arr[x].filename,
                        id: arr[x].body.attachmentId
                    });
                }
            } else if (arr[x]) {
                attachments = [...attachments, ...await this.getAttachmentPart(arr[x].parts)];
            }
        }
        return attachments;
    },

    async getMessagePartFromHeaders(headers, part) {
        try {
            let index = -1;
            for (let i = 0; i < headers.length; i++) {
                if (headers[i].name == part) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                return headers[index].value;
            } else {
                return '';
            }
        } catch (err) {
            throw new Error(err);
        }
    },

    async getEmailTrackingDetails(emailId) {
        try {
            let trackingObject;
            let [err, email] = await to(
                Emails.findOne({
                    where: {
                        email_online_id: emailId
                    },
                    include: [{
                        model: EmailTrackingDetails,
                        as: 'email_tracking_details'
                    }]
                })
            );
            if (email) {
                email = email.toJSON();
                trackingObject = email.email_tracking_details;
            }
            return trackingObject;
        } catch (err) {
            throw new Error(err);
        }
    },

    async downloadAttachment(id, emailId) {
        try {
            return new Promise((resolve) => {
                this.client.users.messages.attachments.get({
                    userId: 'me',
                    id: id,
                    messageId: emailId

                }, (err, result) => {
                    if (err) throw new Error(err);

                    var resultOfBytes = result.data.data
                    resultOfBytes = resultOfBytes.replace(/_/g, '/').replace(/-/g, '+')
                    resolve([null, { contentBytes: resultOfBytes }]);
                });
            })
        } catch (err) {
            return [err, null];
        }
    }
};