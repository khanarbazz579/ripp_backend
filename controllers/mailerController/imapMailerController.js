var base64 = require('./base64Decoder').Base64;
const imapHelper = require("./../../helpers/imapHelper");
const emailUsers = require('./../../models').email_users;
const inspect = require('util').inspect;
const imapMailerController = {};


imapMailerController.getAuthData = async function(user_name, type) {
    let emailError, emailUser;
    [emailError, emailUser] = await to(
        emailUsers.findAll({
            attributes: ['email_user_name', 'email_user_password', 'email_host', 'email_port', 'use_ssl'],
            where: { email_user_name: user_name, type: type }
        })
    );
    if (emailUser.length > 0) {
        return emailUser;
    } else {
        return false;
    }
}

/**
 * getFolders is responsible for fetch all types of email folders from custom mail server.
 * In this route first check username is exist or not if username exist then send 
 * request to mail server for fetch email folders. Otherwise send error response.
 * @module imapMailerController
 * @method getFolders
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.getFolders = async function(req, res) {
   
    const userName = req.body.graph_user_name;
    let parms = {};
    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {

                    
                    
                    imap.getFolders(client[0].email_host).then(folders => {
                        //imap.end();
                       
                        imap.logout();
                        res.json(folders);
                    }).catch(err => {
                        parms.message = 'Error in fetch folders';
                        parms.error = { status: `Invalid_Request: ${err}.` };
                        return res.json(parms);
                    });
                })
                // .catch(err => {
                //     parms.message = 'Error in fetch folders';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in fetch folders';
            parms.error = { status: `${err.code}: ${err.message}` };
            return res.json(parms);
        }
    } else {
        parms.message = 'Error in fetch folders';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * getMail is responsible for fetch folder wise emails from mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for fetch emails. Otherwise send error response.
 * @module imapMailerController
 * @method getMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.folder_id {String} {Optional}
 * @param req.limit {Number} {Optional}
 * @param req.offset {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.getMail = async function(req, res) {
    const userName = req.body.graph_user_name;
    const folderId = req.body.folder_id || "INBOX";
    const limit = req.body.limit || 10;
    const offset = req.body.offset || 1;
    let parms = {};

    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {
                    imap.getMessages(folderId, offset, limit).then(messages => {
                        imap.logout();
                       
                        res.json({
                            mails: messages,
                            offset: offset + limit
                        });
                    }).catch(err => {
                        parms.message = 'Error in fetch mails';
                        parms.error = { status: `Invalid_Request: ${err}.` };
                        return res.json(parms);
                    });
                })
                // .catch(err => {
                //     parms.message = 'Error in fetch mails';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in fetch mails';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in fetch mails';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
}

/**
 * getMailById is responsible for fetch perticular email by unique id from mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for fetch email. Otherwise send error response.
 * @module imapMailerController
 * @method getMailById
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param req.folder_id {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.getMailById = async function(req, res) {
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;
    const folderId = req.body.folder_id;
    let parms = {};
    if (!folderId) {
        parms.message = 'Error in fetch mail by id';
        parms.error = { status: `Invalid_Parameters: Email folder id required.` };
        return res.json(parms);
    }
    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {
                    imap.getMailById(folderId, mailId).then(messages => {
                        console.log('****messages',messages);
                        imap.logout();
                        res.json(messages);
                    }).catch(err => {
                        parms.message = 'Error in fetch mail by id';
                        parms.error = { status: `Invalid_Request: ${err}.` };
                        return res.json(parms);
                    });
                })
                // .catch(err => {
                //     parms.message = 'Error in fetch mail by id';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in fetch mail by id';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in fetch mail by id';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * updateMail is responsible for update perticular email by unique id on mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for fetch email. Otherwise send error response.
 * @module imapMailerController
 * @method updateMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param req.folder_id {String} {Optional}
 * @param req.isRead {Boolean} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.updateMail = async function(req, res) {
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;
    const folderId = req.body.folder_id;
    const isRead = req.body.isRead;
    let parms = {};
    if (!folderId) {
        parms.message = 'Error in email update';
        parms.error = { status: `Invalid_Parameters: Email folder id required.` };
        return res.json(parms);
    }
    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {
                    imap.updateEmail(folderId, mailId, isRead).then(messages => {
                        imap.logout();
                        res.json({ status: `Success`, message: `Email successfully updated.` });
                    })
                    // .catch(err => {
                    //     parms.message = 'Error in email update';
                    //     parms.error = { status: `Invalid_Request: ${err}.` };
                    //     return res.json(parms);
                    // });
                })
                // .catch(err => {
                //     parms.message = 'Error in email update';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in email update';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in email update';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * moveOrCopyMail is responsible for move or copy perticular email by unique id on mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for fetch email. Otherwise send error response.
 * @module imapMailerController
 * @method moveOrCopyMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.destination_id {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.moveOrCopyMail = async function(req, res) {
    let parms = {};
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;
    const action = req.body.action;
    const destinationId = req.body.destination_id;
    const fromId = req.body.from_id;
    var isMove = false;
    var msg = '';
    if (action == 'copy') {
        isMove = false;
        msg = 'copied';
    } else {
        isMove = true;
        msg = 'moved';
    }
    if (!destinationId) {
        parms.message = 'Error in copy/move mail';
        parms.error = { status: `Invalid_Parameters: Destination folder id required.` };
        return res.json(parms);
    }
    if (!fromId) {
        parms.message = 'Error in copy/move mail';
        parms.error = { status: `Invalid_Parameters: From folder id required.` };
        return res.json(parms);
    }
    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {
                    imap.copyMoveEmail(mailId, fromId, destinationId, isMove).then(messages => {
                        imap.logout();
                        res.json({ status: `Success`, message: `Email successfully ${msg}.` });
                    })
                    // .catch(err => {
                    //     parms.message = 'Error in copy/move mail';
                    //     parms.error = { status: `Invalid_Request: ${err}.` };
                    //     return res.json(parms);
                    // });
                })
                // .catch(err => {
                //     parms.message = 'Error in copy/move mail';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in copy/move mail';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in copy/move mail';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * saveDraft is responsible for save  email with attachment or without attachment by mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for fetch email. Otherwise send error response.
 * @module imapMailerController
 * @method saveDraft
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Optional}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Optional}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 *  @param req.isAll {Boolean} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.saveDraft = async function(req, res) {
    let parms = {};
    let mailData = req.body.mail;
    const userName = req.body.graph_user_name;
    const encodedMessage = mailData.message.toString();
    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {
                    imap.saveEmail(encodedMessage).then(messages => {
                        imap.logout();
                        res.json({ status: `Success`, message: `Email successfully saved.` });
                    })
                    // .catch(err => {
                    //     parms.message = 'Error in email saving';
                    //     parms.error = { status: `Invalid_Request: ${err}.` };
                    //     return res.json(parms);
                    // });
                })
                // .catch(err => {
                //     parms.message = 'Error in email saving';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in email saving';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in email saving';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * sendMail is responsible for send email with attachment or without attachment by email server.
 * In this route first check user is exist or not if user exist then send 
 * request to email server for send email. Otherwise send error response.
 * @module imapMailerController
 * @method sendMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Required}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.sendMail = async function(req, res) {
    let parms = {};
    let mailData = req.body.mail;
    const userName = req.body.graph_user_name;
    const client = await imapMailerController.getAuthData(userName, "SMTP");
    if (client) {
        try {
            const encodedMessage = mailData.message;
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true, true)
                .then(smtp => {
                    smtp.sendMail(encodedMessage, function(err) {
                        if (err) {
                            parms.message = 'Error in email sending';
                            parms.error = { status: `Invalid_Request: ${err}.` };
                            return res.json(parms);
                        } else {
                            res.json({ status: `Success`, message: `Email successfully sent.` });
                        }
                    });
                })
                // .catch(err => {
                //     parms.message = 'Error in email sending';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in email sending';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in email sending';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * replayMail is responsible for send reply email with attachment or without attachment by mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for send reply email. Otherwise send error response.
 * @module googleMailerController
 * @method sendMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Required}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param req.mail.comment {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.replayMail = async function(req, res) {
    let parms = {};
    let mailData = req.body.mail;
    const userName = req.body.graph_user_name;
    const client = await imapMailerController.getAuthData(userName, "SMTP");
    if (client) {
        try {
            const encodedMessage = mailData.message;
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true, true)
                .then(smtp => {
                    smtp.sendMail(encodedMessage, function(err) {
                        if (err) {
                            parms.message = 'Error in email replying';
                            parms.error = { status: `Invalid_Request: ${err}.` };
                            return res.json(parms);
                        } else {
                            res.json({ status: `Success`, message: `Email successfully sent.` });
                        }
                    });
                })
                // .catch(err => {
                //     parms.message = 'Error in email replying';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in email replying';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in email replying';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * createReplyMail is responsible for send reply email with attachment or without attachment by mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for save reply email. Otherwise send error response.
 * @module imapMailerController
 * @method createReplyMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Required}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param req.mail.comment {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.createReplyMail = async function(req, res) {
    let parms = {};
    let mailData = req.body.mail;
    const userName = req.body.graph_user_name;
    const encodedMessage = mailData.message.toString();
    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {
                    imap.saveEmail(encodedMessage).then(messages => {
                        imap.logout();
                        res.json({ status: `Success`, message: `Email successfully saved.` });
                    })
                    // .catch(err => {
                    //     parms.message = 'Error in email saving';
                    //     parms.error = { status: `Invalid_Request: ${err}.` };
                    //     return res.json(parms);
                    // });
                })
                // .catch(err => {
                //     parms.message = 'Error in email saving';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in email saving';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in email saving';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * forwordMail is responsible for forword email with attachment or without attachment by mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for forword email. Otherwise send error response.
 * @module imapMailerController
 * @method forwordMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.action {String} {Required}
 * @param req.from_id {String} {Required}
 * @param req.mail {Object} {Required}
 * @param req.mail.message {Object} {Required}
 * @param req.mail.message.subject {String} {Optional}
 * @param req.mail.message.body {Object} {Required}
 * @param req.mail.message.body.contentType {String} {Optional}
 * @param req.mail.message.body.content {String} {Optional}
 * @param req.mail.message.toRecipients {Array} {Required}
 * @param req.mail.message.Attachments {Object} {Array}
 * @param req.mail.message.Attachments[index].name {String} {optional}
 * @param req.mail.message.Attachments[index].contentBytes {String} {optional}
 * @param req.mail.message.BccRecipients {Array} {Optional}
 * @param req.mail.message.Categories {Array} {Optional}
 * @param req.mail.message.CcRecipients {Array} {Optional}
 * @param req.mail.message.ReplyTo {Array} {Optional}
 * @param req.mail.SaveToSentItems {Boolean} {Optional}
 * @param req.mail.comment {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
imapMailerController.forwordMail = async function(req, res) {
    let parms =  {};
    return parms;

    // let mailData = req.body.mail;
    // const userName = req.body.graph_user_name;
    // const client = await imapMailerController.getAuthData(userName, "SMTP");
    // if (client) {
    //     try {
    //         const encodedMessage = mailData.message;
    //         new imapHelper(client[0].email_user_name,
    //                 client[0].email_user_password,
    //                 client[0].email_host,
    //                 client[0].email_port,
    //                 true, true)
    //             .then(smtp => {
    //                 smtp.sendMail(encodedMessage, function(err) {
    //                     if (err) {
    //                         parms.message = 'Error in email forwording';
    //                         parms.error = { status: `Invalid_Request: ${err}.` };
    //                         return res.json(parms);
    //                     } else {
    //                         res.json({ status: `Success`, message: `Email successfully sent.` });
    //                     }
    //                 });
    //             }).catch(err => {
    //                 parms.message = 'Error in email forwording';
    //                 parms.error = { status: `Invalid_Request: ${err}.` };
    //                 return res.json(parms);
    //             });
    //     } catch (err) {
    //         parms.message = 'Error in email forwording';
    //         parms.error = { status: `${err.code}: ${err.message}` };
    //         res.json(parms);
    //     }
    // } else {
    //     parms.message = 'Error in email forwording';
    //     parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
    //     return res.json(parms);
    // }
};

/**
 * getAttachment is responsible for get attachment from mail server.
 * In this route first check user is exist or not if user exist then send 
 * request to mail server for fetch email attachment. Otherwise send error response.
 * @module imapMailerController
 * @method getAttachment
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param req.folder_id {String} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
imapMailerController.getAttachment = async function(req, res) {
    let parms = {};
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;
    const folderId = req.body.folder_id;
    if (!folderId) {
        parms.message = 'Error in fetch mail by id';
        parms.error = { status: `Invalid_Parameters: Email folder id required.` };
        return res.json(parms);
    }
    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {
                    imap.getAttachment(folderId, mailId).then(attachments => {
                        imap.logout();
                        res.json(attachments);
                    })
                    // .catch(err => {
                    //     parms.message = 'Error in fetch attachment';
                    //     parms.error = { status: `Invalid_Request: ${err}.` };
                    //     return res.json(parms);
                    // });
                })
                // .catch(err => {
                //     parms.message = 'Error in fetch attachment';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in fetch attachment';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in fetch attachment';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

/**
 * searchMail is responsible for search email by query params from mail server.
 * In this route first check token is exist or not if token exist then send 
 * request to mail server for search emails. Otherwise send error response.
 * @module imapMailerController
 * @method searchMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.search_text {String} {Required}
 * @param req.folder_id {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
imapMailerController.searchMail = async function(req, res) {
    let parms = {};
    const userName = req.body.graph_user_name;
    const searchText = req.body.search_text;
    const folderId = req.body.folder_id;
    if (!folderId) {
        parms.message = 'Error in fetch mail by id';
        parms.error = { status: `Invalid_Parameters: Email folder id required.` };
        return res.json(parms);
    }
    const client = await imapMailerController.getAuthData(userName, "IMAP");
    if (client) {
        try {
            new imapHelper(client[0].email_user_name,
                    client[0].email_user_password,
                    client[0].email_host,
                    client[0].email_port,
                    true)
                .then(imap => {
                    imap.searchEmails(folderId, searchText).then(attachments => {
                        imap.logout();
                        res.json({
                            mails: attachments,
                            offset: 1
                        });
                    })
                    // .catch(err => {
                    //     parms.message = 'Error in fetch mails';
                    //     parms.error = { status: `Invalid_Request: ${err}.` };
                    //     return res.json(parms);
                    // });
                })
                // .catch(err => {
                //     parms.message = 'Error in fetch mails';
                //     parms.error = { status: `Invalid_Request: ${err}.` };
                //     return res.json(parms);
                // });
        } catch (err) {
            parms.message = 'Error in fetch mails';
            parms.error = { status: `${err.code}: ${err.message}` };
            res.json(parms);
        }
    } else {
        parms.message = 'Error in email searching';
        parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
        return res.json(parms);
    }
};

module.exports = imapMailerController;