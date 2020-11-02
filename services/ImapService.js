const Imap = require('imap');
const inspect = require('util').inspect;
const nodemailer = require("nodemailer");
const imapHelper = require("./../helpers/imapHelper");
const EmailUsers = require('./../models').email_users;
const MailComposer = require('nodemailer/lib/mail-composer');
const EmailTrackingDetails = require('./../models').email_tracking_details;
const Emails = require('./../models').emails;
const multerS3UserProfile = require('./multerS3UserProfile');

module.exports = {
        client: {},

        async init(userName, type) {
            try {
                let [userError, user] = await this.getEmailUser(userName, type);
                if (userError) {
                    return [userError, null];
                }

                let [err, imapHelperObject] = await toA(
                    new imapHelper(
                        user.email_user_name,
                        user.email_user_password,
                        user.email_host,
                        user.email_port,
                        true,
                        type == "SMTP"
                    )
                );
                if (err) {
                    return [err, null];
                }
                this.client = imapHelperObject;
                return [null, this];
            } catch (err) {
                return [err, null]
            }
        },

        async getUserDetails() {
            try {
                return [null,
                    {
                        username: this.client.imap._config.user,
                        surname: '',
                        raw: ''
                    }
                ];
            } catch (err) {
                return [err, null]
            }
        },

        async getEmailUser(userName, type) {
            try {
                let [err, user] = await to(
                    EmailUsers.findOne({
                        attributes: ['email_user_name', 'email_user_password', 'email_host', 'email_port', 'use_ssl'],
                        where: { email_user_name: userName, type: type }
                    })
                );
                if (err) throw new Error(err);
                return [null, user];
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
            } catch (err) {
                throw new Error(err);
            }
        },

        async sendEmail(body, email_user_name) {
            try {
                let [tos, cc, bcc] = await this.manageRecipient(body);
                let attachments = await this.manageAttachment(body);
                let mesId = +new Date();
                let mailData = {
                    to: tos.join(),
                    cc: cc.join(),
                    Bcc: bcc.join(),
                    text: body.message,
                    html: body.message,
                    subject: body.subject,
                    textEncoding: "base64",
                    attachments: attachments,
                    messageId: mesId + '@ripple.com',
                    inReplyTo: [mesId + '@ripple.com'],
                    references: [mesId + '@ripple.com'],
                    from: email_user_name
                };
                if (body.id) {
                    mailData.references = [body.conversation_id];
                    mailData.inReplyTo = [body.conversation_id];
                }
                return new Promise((resolve, reject) => {
                    this.client.sendMail(mailData, (err, result) => {
                        if (err) return reject([err, null]);
                        let messageId = result.messageId;
                        if (this.client.options.host.search('outlook.com') != -1) {
                            messageId = "<" + result.response.substring(
                                result.response.lastIndexOf("<") + 1,
                                result.response.lastIndexOf(">")
                            ) + ">";
                        }
                        resolve([null, {
                            email_online_id: messageId,
                            conversation_id: messageId
                        }]);
                    });
                })

            } catch (err) {
                return [err, null];
            }
        },

        async fetchEmail(conversationId, providerName) {
            try {
                return new Promise(async (resolve) => {
                    this.client.imap.once('ready', async (conerr) => {
                        if (conerr) return resolve([conerr, []]);
                        let inbox = "Inbox";
                        let allEmails = [];
                        if (this.client.imap._config.host.search('gmail.com') != -1) {
                            inbox = '[Gmail]/All Mail';
                        } else {
                            let [sentMailError, sentEmails] = await toA(this.client.fetchEmailInThread('Sent', [
                                'ALL',
                                ['OR', ['HEADER', 'message-Id', conversationId],
                                    ['HEADER', 'IN-REPLY-TO', conversationId]
                                ]
                            ]));

                            if (sentMailError) throw new Error(sentMailError);
                            allEmails = sentEmails;
                        }
                        let [err, emails] = await toA(this.client.fetchEmailInThread(inbox, [
                            'ALL',
                            ['OR', ['HEADER', 'message-Id', conversationId],
                                ['HEADER', 'IN-REPLY-TO', conversationId]
                            ]
                        ]));
                        if (err) throw new Error(err);
                        if (emails && emails.length > 0)
                            allEmails = [...allEmails, ...emails];

                        let managedEmails = await this.manageEmails(allEmails);
                        return resolve([null, managedEmails]);
                    });
                })
            } catch (err) {
                return [err, null];
            }

        },


        async manageEmails(emails) {
            let managedEmails = [];
            try {
                for (let i = 0; i < emails.length; i++) {
                    let email = {
                        id: emails[i].id,
                        conversation_id: emails[i].conversationId,
                        created_at: emails[i].createdDateTime,
                        received_at: emails[i].receivedDateTime,
                        sent_at: emails[i].sentDateTime,
                        has_attachment: emails[i].hasAttachments,
                        subject: emails[i].subject,
                        body_preview: emails[i].bodyPreview,
                        is_draft: emails[i].isDraft,
                        body: emails[i].body.content,
                        from: emails[i].from.emailAddress.name + ' < ' + emails[i].from.emailAddress.address + ' >',
                        to: [],
                        cc: [],
                        bcc: [],
                        reply_to: [],
                        attachments: [],
                        raw: JSON.stringify(emails[i]),
                        tracking: await this.getEmailTrackingDetails(emails[i].id)
                    };

                    if (emails[i].toRecipients && emails[i].toRecipients.length > 0) {
                        for (let j = 0; j < emails[i].toRecipients.length; j++) {
                            if (emails[i].toRecipients[j] && emails[i].toRecipients[j])
                                email.to.push(emails[i].toRecipients[j].name + ' < ' + emails[i].toRecipients[j].address + ' > ');
                        }
                    }

                    if (emails[i].hasAttachments) {
                        email.attachments = emails[i].attachments;
                    }
                    managedEmails.push(email);
                }
                return managedEmails;
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
                let inbox = "Inbox";
                let err, attachment;
                    if (this.client.imap._config.host.search('gmail.com') != -1) {
                        inbox = '[Gmail]/All Mail';
                    }
                    [err, attachment] = await toA(
                        this.client.getMailAttachment(inbox, emailId, id)
                    );
                    if (!attachment) {
                        inbox = "Sent";
                        [err, attachment] = await toA(
                            this.client.getMailAttachment(inbox, emailId, id)
                        );
                    }
                    return [err, { contentBytes: attachment }];
                }
                catch (err) {
                    return [err, null];
                }
            }
        }