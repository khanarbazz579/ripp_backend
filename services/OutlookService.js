const Outlook = require('./../helpers/authHelper');
const { credentials, authForData } = require('./../config/outlookmailapp');
const outlookHelper = new Outlook(credentials, authForData);
const graph = require('@microsoft/microsoft-graph-client');
const Emails = require('./../models').emails;
const EmailTrackingDetails = require('./../models').email_tracking_details;
const multerS3UserProfile = require('./multerS3UserProfile');

module.exports = {
    client: {},

    async init(emailUser) {
        try {
            let token = await outlookHelper.getAccessToken(emailUser);
            if (token) {
                this.client = graph.Client.init({
                    authProvider: (done) => {
                        done(null, token);
                    }
                });
                return [null, this];
            } else {
                return ['Invalid authentication request to provider server.', null];
            }
        } catch (err) {
            return [err, null];
        }
    },

    async getUserDetails() {
        try {
            let res = await this.client.api('/me')
                .get();
            return [null,
                {
                    username: res.displayName,
                    surname: res.surname,
                    raw: JSON.stringify(res)
                }
            ]
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
                    tos.push({
                        emailAddress: {
                            address: body.to[i].email.trim()
                        }
                    })
                }
            }
            if (body.cc && body.cc.length > 0) {
                for (let i = 0; i < body.cc.length; i++) {
                    cc.push({
                        emailAddress: {
                            address: body.cc[i].email.trim()
                        }
                    })
                }
            }
            if (body.bcc && body.bcc.length > 0) {
                for (let i = 0; i < body.bcc.length; i++) {
                    bcc.push({
                        emailAddress: {
                            address: body.bcc[i].email.trim()
                        }
                    })
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
                        '@odata.type': "#microsoft.graph.fileAttachment",
                        'name': body.attachment[i].file_name,
                        'contentType': body.attachment[i].type,
                        'contentBytes': content
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
            const mailData = {
                "message": {
                    "subject": body.subject,
                    "body": {
                        "contentType": "html",
                        "content": body.message
                    },
                    "toRecipients": tos,
                    "ccRecipients": cc,
                    "bccRecipients": bcc,
                    attachments: attachments
                },
            };
            if (body.id) {
                await this.client.api(`/me/messages/${body.id}/reply`).post(mailData);
            } else {
                await this.client.api(`/me/sendmail`).post(mailData);
            }
            const result = await this.getLastSentMessage();
            return [null, {
                email_online_id: result.value[0].id,
                conversation_id: result.value[0].conversationId
            }];
        } catch (err) {
            return [err, null]
        }
    },

    async getLastSentMessage() {
        try {
            const result = this.client
                .api(`/me/mailfolders/SentItems/messages`)
                .top(1)
                .skip(0)
                .orderby('receivedDateTime DESC')
                .get();
            return result;
        } catch (e) {
            throw new Error(e);
        }
    },

    async fetchEmail(conversationId) {
        try {
            const result = await this.client
                .api(`/me/mailfolders/AllItems/messages`)
                .filter(`conversationId  eq '${conversationId}'`)
                .get();
            if (result && result.value && result.value.length > 0) {
                let managedEmails = await this.manageEmails(result.value);
                return [null, managedEmails];
            } else {
                return ["No emails found", {}];
            }
        } catch (err) {
            return [err, null];
        }
    },

    async manageEmails(emails) {
        let managedEmails = [];
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

            for (let j = 0; j < emails[i].toRecipients.length; j++) {
                email.to.push(emails[i].toRecipients[j].emailAddress.name + ' < ' + emails[i].toRecipients[j].emailAddress.address + ' > ');
            }



            if (emails[i].hasAttachments) {
                let [attachmentsError, attachmentsObject] = await this.mailAttachments(emails[i].id);
                if (attachmentsError) {
                    email.attachments = {
                        error: true,
                        message: attachmentsError
                    }
                } else {
                    email.attachments = attachmentsObject;
                }
            }
            managedEmails.push(email);
        }
        return managedEmails;

    },

    async mailAttachments(id) {
        try {
            let attachments = [];
            const result = await this.client
                .api(`/me/messages/${id}/attachments`)
                .select('name')
                .get();
            if (result && result.value && result.value.length > 0) {
                for (let i = 0; i < result.value.length; i++) {
                    attachments.push({
                        content_type: result.value[i]['@odata.mediaContentType'],
                        name: result.value[i].name,
                        id: result.value[i].id
                    })
                }
                return [null, attachments];
            } else {
                return ["Error in fetching attachments", null];
            }
        } catch (err) {
           return [err, null];
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
            const result = await this.client
                .api(`/me/messages/${emailId}/attachments/${id}`)
                .get();
            return [null, result];
        } catch (err) {
            return [err, null];
        }
    }
}