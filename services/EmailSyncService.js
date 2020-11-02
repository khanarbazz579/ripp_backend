const EmailUsersModel = require('./../models').email_users;
const EmailProviderModel = require('./../models').email_providers;
const Emails = require('./../models').emails;
const EmailUserDetails = require('./../models').email_user_details;
const EmailTrackingDetails = require('./../models').email_tracking_details;
const EmailAttachments = require('./../models').email_attachments;
const EmailSignature = require('./../models').email_signatures;
const multerS3UserProfile = require('./multerS3UserProfile');
const Contact = require("./../models").contacts;
const Users = require("./../models").users;
const OutlookService = require('./OutlookService');
const GoogleService = require('./GoogleService');
const ImapService = require('./ImapService');
const CommonFunction = require('./commonFunction');
const md5 = require('md5');


let trackingDomain = "https://api.devsubdomain.com/api/mailer/";

let EmailSynService = {
    async getUserDetails(user) {
        try {
            let userStatus = {};
            let connectionError, connectionObject;
            if (user.email_provider.email_provider_name == "Outlook") {
                [connectionError, connectionObject] = await OutlookService.init(user.email_user_name);
            } else if (user.email_provider.email_provider_name == "Gmail") {
                [connectionError, connectionObject] = await GoogleService.init(user.email_user_name);
            } else {
                [connectionError, connectionObject] = await ImapService.init(user.email_user_name, "IMAP");
            }
            if (connectionError) {
                throw new Error(connectionError);
            }
            let [userError, userObject] = await connectionObject.getUserDetails();
            if (userError) {
                throw new Error(userObject);
            }
            return [null, userObject]
        } catch (err) {
            return [err, null];
        }
    },

    async checkMailerProviderActive(userId, body) {
        try {
            let connectionObject, connectionError;
            let [err, emailUser] = await to(
                EmailUsersModel.findOne({
                    where: {
                        user_id: userId
                    },
                    include: [{
                        model: EmailProviderModel,
                        attributes: ['email_provider_name']
                    }]
                })
            );

            if (err) throw new Error(err);
            if (!emailUser) throw new Error("No email user found.");
            emailUser = emailUser.toJSON();
            let signature = await this.getEmailSignature(userId);
            let trackingCode = md5(+new Date());
            let img = `<img src="${trackingDomain}${trackingCode}/tracker.png">`;
            body.message = body.message + " " + signature + img;

            if (emailUser.email_provider.email_provider_name == "Outlook") {
                [connectionError, connectionObject] = await OutlookService.init(emailUser.email_user_name);
            } else if (emailUser.email_provider.email_provider_name == "Gmail") {
                [connectionError, connectionObject] = await GoogleService.init(emailUser.email_user_name);
            } else {
                [connectionError, connectionObject] = await ImapService.init(emailUser.email_user_name, "SMTP");
            }
            if (connectionError) {
                return [connectionError, null];
            }
            let [sendingError, messageObject] = await connectionObject.sendEmail(body, emailUser.email_user_name);
            if (sendingError) {
                return [sendingError, null];
            }
            let [serr, semail] = await to(
                Emails.create({
                    lead_id: body.lead_id,
                    subject: body.subject,
                    user_id: userId,
                    provider: emailUser.email_provider.email_provider_name,
                    email_user: emailUser.email_user_name,
                    conversation_id: messageObject.conversation_id,
                    email_online_id: messageObject.email_online_id,
                    tracking_code: trackingCode,
                    parent_id: body.id ? 1 : 0
                })
            );
            if (serr) throw new Error(serr);
            if (semail) {
                semail = semail.toJSON();
            } else {
                throw new Error("Error in create message records.");
            }
            await this.createEmailUserDetails(body, trackingCode, semail.id);
            return [null];
        } catch (e) {
            return [e, ''];
        }
    },

    async createEmailUserDetails(body, trackingCode, mailId) {
        let createTrackingUser = [];
        if (body.to && body.to.length > 0) {
            for (let i = 0; i < body.to.length; i++) {
                createTrackingUser.push({
                    user_id: body.to[i].id,
                    user_email: body.to[i].email,
                    tracking_code: trackingCode,
                    email_id: mailId,
                    user_type: 'TO',
                })
            }
        }

        if (body.cc && body.cc.length > 0) {
            for (let i = 0; i < body.cc.length; i++) {
                createTrackingUser.push({
                    user_id: body.cc[i].id,
                    user_email: body.cc[i].email,
                    tracking_code: trackingCode,
                    mail_id: mailId,
                    user_type: 'CC',
                })
            }
        }

        if (body.bcc && body.bcc.length > 0) {
            for (let i = 0; i < body.bcc.length; i++) {
                createTrackingUser.push({
                    user_id: body.bcc[i].id,
                    user_email: body.bcc[i].email,
                    tracking_code: trackingCode,
                    mail_id: mailId,
                    user_type: 'BCC',
                })
            }
        }
        return await to(
            EmailUserDetails.bulkCreate(createTrackingUser)
        );
    },

    async getEmailSignature(userId) {
        let err, email_signature;
        [err, email_signature] = await to(
            EmailSignature.findOne({
                where: {
                    user_id: userId
                }
            })
        );
        if (err) throw new Error(err);
        if (email_signature) {
            email_signature = email_signature.toJSON();
            let path = `email-signatures/${email_signature.file_path}`;
            let promise = await multerS3UserProfile.getFileFromAWS(path);
            return `<div style="position:absolute; left:0; bottom:0;">
                  ${promise}
             </div>`

        } else {
            return '';
        }
    },

    async trackEmail(emailTrackingCode) {
        let err, email, trackingDetails;
        [err, email] = await to(
            Emails.findOne({
                where: {
                    tracking_code: emailTrackingCode
                }
            })
        );
        if (err) throw new Error(err);

        if (!email) {
            return;
        }
        email = email.toJSON();
        [err, trackingDetails] = await to(
            EmailTrackingDetails.findOne({
                where: {
                    tracking_code: emailTrackingCode
                }
            })
        );
        if (err) throw new Error(err);
        if (trackingDetails) {
            return;
        }
        [err] = await CommonFunction.insertNotification({
            start: new Date(),
            user_id: email.user_id,
            id: email.id,
            reminder: 1,
        }, 'EMAIL');

        if (err) throw new Error(err);

        return EmailTrackingDetails.create({
            tracking_code: emailTrackingCode,
            mail_id: email.id
        })
    },

    async getEmailHistory(leadId) {
        try {
            let [err, emails] = await to(
                Emails.findAll({
                    where: {
                        lead_id: leadId,
                        conversation_id: {
                            '$ne': null
                        },
                        "$or": [
                            { parent_id: 0 },
                            { provider: "Other Provider" }
                        ]
                    },
                    include: [{
                        model: EmailTrackingDetails,
                        as: 'email_tracking_details'
                    }],
                    order: [['created_at', 'DESC']]
                })

            );
            if (err) throw new Error(err);
            return await this.getEmailsFromServer(emails);
        } catch (e) {
            throw new Error(e);
        }
    },

    async getEmailsFromServer(emails) {
        try {
            let serverEmails = [];
            let serviceObject, serviceError;
            for (let i = 0; i < emails.length; i++) {
                let email = emails[i].toJSON();
                let [emailUserErr, emailUser] = await to(
                    EmailUsersModel.findOne({
                        where: {
                            user_id: email.user_id,
                            email_user_name: email.email_user
                        }
                    })
                );
                if (!emailUserErr && emailUser) {
                    if (email.provider == "Outlook") {
                        if (email.parent_id == 0)
                            [serviceError, serviceObject] = await OutlookService.init(email.email_user);
                    } else if (email.provider == "Gmail") {
                        if (email.parent_id == 0)
                            [serviceError, serviceObject] = await GoogleService.init(email.email_user);
                    } else {
                        [serviceError, serviceObject] = await ImapService.init(email.email_user, "IMAP");
                    }

                    if (serviceError) {
                        email.error = true;
                        email.error_message = serviceError;
                        serverEmails.push(email);
                    } else {

                        if (serviceObject) {
                            let [emailError, emailObject] = await serviceObject.fetchEmail(email.conversation_id);
                            if (emailError) {
                                email.error = true;
                                email.error_message = emailError;
                                // serverEmails.push(email);
                            } else {
                                email.error = false;
                                email.error_message = '';
                                email.mails = emailObject;
                                serverEmails.push(emailObject);
                            }
                        }
                    }
                }
            }
            return serverEmails;
        } catch (err) {
            throw new Error(err);
        }
    },

    async downloadAttachment(userId, id, emailId) {
        try {
            let connectionObject, connectionError;
            let [err, emailUser] = await to(
                EmailUsersModel.findOne({
                    where: {
                        user_id: userId
                    },
                    include: [{
                        model: EmailProviderModel,
                        attributes: ['email_provider_name']
                    }]
                })
            );

            if (err) throw new Error(err);
            if (!emailUser) throw new Error("No email user found.");
            emailUser = emailUser.toJSON();
            if (emailUser.email_provider.email_provider_name == "Outlook") {
                [connectionError, connectionObject] = await OutlookService.init(emailUser.email_user_name);
            } else if (emailUser.email_provider.email_provider_name == "Gmail") {
                [connectionError, connectionObject] = await GoogleService.init(emailUser.email_user_name);
            } else {
                [connectionError, connectionObject] = await ImapService.init(emailUser.email_user_name, "IMAP");
            }
            let [fileErr, fileObject] = await connectionObject.downloadAttachment(id, emailId);
            return [fileErr, fileObject]
        } catch (err) {
            return [err, null];
        }
    }
}


module.exports = EmailSynService;
