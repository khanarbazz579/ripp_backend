var base64 = require("./base64Decoder").Base64;



const authHelper = require("./../../helpers/googleAuthHelper");
const inspect = require('util').inspect;
let googleMailerController = {};
const auth = new authHelper();


googleMailerController.refresh = async function (req, res) {
    auth.refresh();
    res.json({ status: 'Success' }).status(200);
}

/**
 * generateRequest is responsible for create authontication request.
 * @module googleMailerController
 * @method generateRequest
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
googleMailerController.generateRequest = async function (req, res) {


    let parms = {};
    const userName = req.body.graph_user_name;
    const clearExistToken = null; //await auth.checkTokenExist(userName);

    try {
        if (!clearExistToken) {
            const isTokenRequest = await auth.createTokenRequest(userName, req.connection.remoteAddress,req.user.id);
            if (isTokenRequest) {
                res.json({
                    status: "Success",
                    message: "Auth request successfully created.",
                    url: await auth.getAccessUrl()
                });
            } else {
                throw ({
                    message: 'Error in request generate',
                    error: {
                        status: `Server_Error: Inetrnal server error.`
                    }
                });
            }
        } else {
            res.json({
                status: "Success",
                alive: true,
                message: "Auth request successfully created.",
                url: await auth.getAccessUrl()
            });
        }
    } catch (err) {
        res.json(err);
    }
}

/**
 * After send authontication request to google server with
 * scopes google server redirect on this route with parameters and tokens
 * in this route validate provided auth code is valid or not.
 * If valid then generate auth token and store in database. otherwise send error response.
 * @module googleMailerController
 * @method googleAuthorize
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.code {String} {Code that's returns from google server in query string.}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
googleMailerController.googleAuthorize = function (req, res) {
    const code = req.query.code;
    let parms = {};
    if (code) {
        auth.authorize(code, (err, token) => {
            if (err) {
                res.json("Error");
            } else {
                res.send(`<script> setTimeout(function(){
                        window.close();
                    },1000);</script>`);
            }
        });
    } else {
        parms.message = 'Error in authontiocation';
        parms.error = { status: `Invalid_Request: Genrated request not found.` };
        return res.json(parms);
    }
};

/**
 * getFolders is responsible for fetch all types of email folders from google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for fetch email folders. Otherwise send error response.
 * @module googleMailerController
 * @method getFolders
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
googleMailerController.getFolders = async function (req, res) {
    const userName = req.body.graph_user_name;
    let parms = {};

    const client = await auth.getAccessToken(userName);
    if (client) {
        try {
            client.users.labels.list({
                userId: 'me',
            }, async (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in fetch folders',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                const labels = result.data.labels;
                if (labels.length) {
                    let folders = [];
                    for (var i = 0; i < labels.length; i++) {
                        var folder = await googleMailerController.getFolderDetail(client, labels[i].id);
                        folders.push(folder);
                    }
                    return res.json(folders);
                } else {
                    return res.json({ status: "Suceess", message: "No folders found" });
                }
            });
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
 * getMail is responsible for fetch folder wise emails from google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for fetch emails. Otherwise send error response.
 * @module googleMailerController
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
// googleMailerController.getMail = async function (req, res) {

//     const userName = req.body.graph_user_name;
//     const folderId = req.body.folder_id || "INBOX";
//     const limit = req.body.limit || 10;
//     const offset = req.body.offset || null;
//     let parms = {};
//     const client = await auth.getAccessToken(userName)
//     if (client) {
//         try {
//             client.users.messages.list({
//                 userId: 'me',
//                 maxResults: limit,
//                 labelIds: [folderId],
//                 pageToken: offset
//             }, async (err, result) => {
//                 if (err) {
//                     throw ({
//                         message: 'Error in fetch emails',
//                         error: {
//                             status: `Invalid_Request: ${err}.`
//                         }
//                     });
//                 }
//                 var mails = result.data.messages;
//                 var mailWithBody = [];
//                 if (mails && mails.length > 0) {
//                     for (var i = 0; i < mails.length; i++) {
//                         var body = await googleMailerController.getMailDetails(client, mails[i].id);
//                         mailWithBody.push(body);
//                     }
//                     res.json({
//                         mails: mailWithBody,
//                         offset: result.data.nextPageToken || null
//                     });
//                 } else {
//                     res.json({ status: "Suceess", message: "No mails found" });
//                 }
//             });
//         } catch (err) {
//             parms.message = 'Error in fetch mails';
//             parms.error = { status: `${err.code}: ${err.message}` };
//             res.json(parms);
//         }
//     } else {
//         parms.message = 'Error in fetch mails';
//         parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
//         return res.json(parms);
//     }
// }

googleMailerController.getMail = async function (req, res) {
    const userName = req.body.graph_user_name;
    const folderId = req.body.folder_id || "INBOX";
    const limit = req.body.limit || 10;
    const offset = req.body.offset || null;
    let parms = {};
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            client.users.messages.list({
                userId: 'me',
                maxResults: limit,
                labelIds: [folderId],
                pageToken: offset
            }, async (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in fetch emails',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }


                var mails = result.data.messages;
                var mailWithBody = [];
                if (mails && mails.length > 0) {
                    for (var i = 0; i < mails.length; i++) {
                        var body = await googleMailerController.getMailDetails(client, mails[i].id);
                        mailWithBody.push(body);
                    }


                    res.json({
                        mails: mailWithBody,
                        offset: result.data.nextPageToken || null
                    });
                } else {
                    res.json({ status: "Suceess", message: "No mails found" });
                }
            });
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

googleMailerController.getMailToSelectAll = async function (req, res) {
    const userName = req.body.graph_user_name;
    const folderId = req.body.folder_id || "INBOX";
    const limit = req.body.limit || 10;

    const offset = req.body.offset;
    let parms = {};
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            client.users.messages.list({
                userId: 'me',
                maxResults: limit,
                //  feilds: id,
                labelIds: [folderId],
                pageToken: offset
            }, async (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in fetch emails',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                var mails = result.data.messages;
                var mailWithBody = [];
                if (mails && mails.length > 0) {
                    for (var i = 0; i < mails.length; i++) {
                        mailWithBody.push(mails[i].id);
                    }
                    res.json({
                        mails: mailWithBody,
                        offset: result.data.nextPageToken || null
                    });
                } else {
                    res.json({ status: "Suceess", message: "No mails found" });
                }
            });
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
 * getMailById is responsible for fetch perticular email by unique id from google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for fetch email. Otherwise send error response.
 * @module googleMailerController
 * @method getMailById
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
googleMailerController.getMailById = async function (req, res) {
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;
    let parms = {};
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            client.users.messages.get({
                userId: 'me',
                id: mailId,
                format: "full"
            }, (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in fetch email by idddd',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                var mail = {
                    id: result.data.id,
                    isRead: result.data.labelIds[0] == 'UNREAD' ? false : true,
                    conversationId: result.data.threadId,
                    categories: result.data.labelIds,
                    bodyPreview: result.data.snippet
                };

                Object.assign(mail, googleMailerController.parseFullMessage(result.data));
                console.log('************',result.data);
                var getSignatureValue = googleMailerController.getSignature(result.data);  
                Object.assign(mail, getSignatureValue);
                res.json(mail);
            });
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
 * updateMail is responsible for update perticular email by unique id on google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for fetch email. Otherwise send error response.
 * @module googleMailerController
 * @method updateMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param req.isRead {Boolean} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
googleMailerController.updateMail = async function (req, res) {
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;
    let parms = {};
    var resource = {};
    if (req.body.isRead) {
        resource.removeLabelIds = ['UNREAD'];
    } else {
        resource.addLabelIds = ['UNREAD'];
    }
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            client.users.messages.modify({
                userId: 'me',
                id: mailId,
                resource: resource,
            }, (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in update email',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                res.json({ status: "Success", message: "Mail successfully updated." });
            });
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

googleMailerController.updateMailArchived = async function (req, res) {
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;
    let parms = {};
    var resource = {};
    if (req.body.isInbox) {
        resource.removeLabelIds = ['INBOX'];
    } else {
        resource.addLabelIds = ['INBOX'];
    }
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            for (let i = 0; i < mailId.length; i++) {
                await googleMailerController.changeLabelArchieved(client, mailId[i], resource);
            }
            res.json({ status: "Success", message: "Mail successfully move." });
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
 * moveOrCopyMail is responsible for move or copy perticular email by unique id on google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for fetch email. Otherwise send error response.
 * @module googleMailerController
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
googleMailerController.moveOrCopyMail = async function (req, res) {

    let parms = {};
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;

    const action = req.body.action;
    const destinationId = req.body.destination_id;
    const fromId = req.body.from_id;
    var resource = {};
    if (action == 'copy') {

        resource.addLabelIds = [destinationId, fromId];
    } else {
        resource.ids = req.body.mail_id;
        resource.addLabelIds = [destinationId];
        resource.removeLabelIds = [fromId];

    }
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {

            await googleMailerController.moveCopyProcess(client, resource);
            //}
            res.json({ status: "Success", message: "Mail successfully move." });
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

googleMailerController.moveCopyProcess = async function (client, resource) {


    console.log('********resource iss',resource)
    return new Promise(async function (resolve) {
        client.users.messages.batchModify({
            userId: 'me',
            resource: resource,
        }, (err, result) => {
            if (err) {
                return resolve(err);
            }
            resolve(result);
        });
    });
}
googleMailerController.changeLabelArchieved = async function (client, mailId, resource) {
    console.log('************Resource is',resource);
    return new Promise(async function (resolve) {
        client.users.messages.modify({
            userId: 'me',
            id: mailId,
            resource: resource,
        }, (err, result) => {
            if (err) {
                return resolve(err);
            }
            resolve(result);
        })
    });









}


/**
 * sendMail is responsible for send email with attachment or without attachment by google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for send email. Otherwise send error response.
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
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
googleMailerController.sendMail = async function (req, res) {
    let parms = {};
    let mailData = req.body.mail;
    const userName = req.body.graph_user_name;
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            const encodedMessage = Buffer.from(mailData.message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            client.users.messages.send({
                userId: "me",
                format: "RAW",
                resource: {
                    raw: encodedMessage
                }
            }, (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in email sending',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                res.json({ status: "Success", message: "Mail successfully sent." });
            });
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
 * replayMail is responsible for send reply email with attachment or without attachment by google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for send reply email. Otherwise send error response.
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
googleMailerController.replayMail = async function (req, res) {
    let parms = {};
    let mailData = req.body.mail;
    const userName = req.body.graph_user_name;
    const client = await auth.getAccessToken(userName);
    if (client) {
        try {
            const encodedMessage = Buffer.from(mailData.message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            client.users.messages.send({
                userId: "me",
                format: "RAW",

                resource: {
                    raw: encodedMessage,
                    threadId: req.body.mail_id
                }
            }, (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in email replying',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                res.json({ status: "Success", message: "Mail successfully sent." });
            });
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
 * saveDraft is responsible for save  email with attachment or without attachment by google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for fetch email. Otherwise send error response.
 * @module googleMailerController
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
googleMailerController.saveDraft = async function (req, res) {
    let parms = {};
    let mailData = req.body.mail;
    const userName = req.body.graph_user_name;
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            const encodedMessage = Buffer.from(mailData.message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            client.users.drafts.create({
                userId: "me",
                format: "RAW",
                resource: {
                    message: {
                        raw: encodedMessage
                    }
                }
            }, (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in email saving',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                res.json({ status: "Success", message: "Mail successfully saved." });
            });
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
 * createReplyMail is responsible for send reply email with attachment or without attachment by google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for save reply email. Otherwise send error response.
 * @module googleMailerController
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
googleMailerController.createReplyMail = async function (req, res) {
    let parms = {};
    let mailData = req.body.mail;
    const userName = req.body.graph_user_name;
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            const encodedMessage = Buffer.from(mailData.message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            client.users.drafts.create({
                userId: "me",
                format: "RAW",
                resource: {
                    message: {
                        raw: encodedMessage,
                        threadId: req.body.mail_id
                    }
                }
            }, (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in email saving',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                res.json({ status: "Success", message: "Mail successfully saved." });
            });
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
 * getAttachment is responsible for get attachment from google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for fetch email attachment. Otherwise send error response.
 * @module googleMailerController
 * @method getAttachment
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
googleMailerController.getAttachment = async function (req, res) {
    let parms = {};
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^hasAttachmentWithInline',req.body.hasAttachmentsWithInline);
    const hasAttachmentsWithInline = req.body.hasAttachmentsWithInline;
    const userName = req.body.graph_user_name;
    const mailId = req.body.mail_id;
    const client = await auth.getAccessToken(userName)
    if (client) {
        try {
            client.users.messages.get({
                userId: 'me',
                id: mailId,
                format: "full"
            }, async (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in fatching attachment',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                if (result.data.payload.parts.length > 0) {
                    var attachmentList = await googleMailerController.getAttachmentList(mailId, client, result.data.payload.parts, hasAttachmentsWithInline);
                    console.log('attachmentList areeeee',attachmentList);
                    res.json(attachmentList);
                } else {
                    parms.message = 'Error in fetch attachment';
                    parms.error = { status: `Invalid_Request: No attachment find.` };
                    res.json(parms);
                }
            });
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
 * forwordMail is responsible for forword email with attachment or without attachment by google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for forword email. Otherwise send error response.
 * @module googleMailerController
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
googleMailerController.forwordMail = async function (req, res) {
    res.json(true);
    // let parms = {};
    // let mailData = req.body.mail;
    // const userName = req.body.graph_user_name;
    // const client = await auth.getAccessToken(userName);
    // if (client) {
    //     try {
    //         const encodedMessage = Buffer.from(mailData.message)
    //             .toString('base64')
    //             .replace(/\+/g, '-')
    //             .replace(/\//g, '_')
    //             .replace(/=+$/, '');
    //         client.users.messages.send({
    //             userId: "me",
    //             format: "RAW",
    //             resource: {
    //                 raw: encodedMessage,
    //                 threadId: req.body.mail_id
    //             }
    //         }, (err, result) => {
    //             if (err) {
    //                 parms.message = 'Error in fetch folders';
    //                 parms.error = { status: `Invalid_Request: ${err}.` };
    //                 return res.json(parms);
    //             }
    //             res.json({ status: "Success", message: "Mail successfully forword." });
    //         });
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
 * searchMail is responsible for search email by query params from google server.
 * In this route first check token is exist or not if token exist then send 
 * request to google server for search emails. Otherwise send error response.
 * @module googleMailerController
 * @method searchMail
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.search_text {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
googleMailerController.searchMail = async function (req, res) {
    let parms = {};
    const userName = req.body.graph_user_name;
    const searchText = req.body.search_text;
    const offset = req.body.offset || null;
    const client = await auth.getAccessToken(userName);
    if (client) {
        try {
            client.users.messages.list({
                userId: 'me',
                q: searchText,
                maxResults: 10,
                pageToken: offset
            }, async (err, result) => {
                if (err) {
                    throw ({
                        message: 'Error in fetch email',
                        error: {
                            status: `Invalid_Request: ${err}.`
                        }
                    });
                }
                var mails = result.data.messages;
                var mailWithBody = [];
                if (mails && mails.length > 0) {
                    for (var i = 0; i < mails.length; i++) {
                        var body = await googleMailerController.getMailDetails(client, mails[i].id);
                        mailWithBody.push(body);
                    }
                    res.json({
                        mails: mailWithBody,
                        offset: result.data.nextPageToken || null
                    });
                } else {
                    res.json({ status: "Suceess", message: "No mails found" });
                }
            });
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

/**
 * getAttachmentList is not route function.
 * This function is use for fetch email attachment list.
 * @param {String} messageId 
 * @param {Object} client 
 * @param {Object} parts 
 * @param {Object}  Promise
 */
googleMailerController.getAttachmentList = async function (messageId, client, parts, hasAttachmentsWithInline) {

    console.log('$$$$$$$$$$$client iss',client);
    var tempArray = [];
    return new Promise(async resolve => {
        var onlyAttachmentValues = true;
        var attachmentObject = {};
        var attachment = [];
        var finalAttachment = [];
        var multiPartRelated = false;
        var mixedAttachmentAndInline = false

        parts.forEach((arrayItem) => {
            attachmentObject = {};
            tempArray.push(arrayItem);
            if (arrayItem.mimeType == 'multipart/related' || arrayItem.mimeType == 'multipart/alternative') {
                multiPartRelated = true;
            }
            attachmentObject = arrayItem;
            attachment.push(attachmentObject);
        })
        if (multiPartRelated) {
            onlyAttachmentValues = false;
        }
        if (tempArray[0]['mimeType'] == 'multipart/alternative') {
            onlyAttachmentValues = true;
            finalValueOfAttachment = true;
        }
        if (tempArray[0]['mimeType'] == 'multipart/related') {
            mixedAttachmentAndInline = true;
        }
        if (onlyAttachmentValues) {
            for (var i = 1; i < attachment.length; i++) {
                var data = await googleMailerController.getAttachmentById(messageId, client, attachment[i], onlyAttachmentValues, hasAttachmentsWithInline, mixedAttachmentAndInline);
                finalAttachment.push(data);
            }
        } else {
            for (var j = 0; j < attachment.length; j++) {
                var data = await googleMailerController.getAttachmentById(messageId, client, attachment[j], onlyAttachmentValues, hasAttachmentsWithInline, mixedAttachmentAndInline);
                finalAttachment.push(data);

            }
        }
        resolve(finalAttachment);
    })
}

/**
 * getAttachmentById is not route function.
 * This function is use for fetch email attachment by attachment id.
 * @param {String} messageId 
 * @param {Object} client 
 * @param {Object} part 
 * @param {Number} count 
 * @param {Object}  Promise
 */
googleMailerController.getAttachmentById = async function (messageId, client, part, onlyAttachmentValues, hasAttachmentsWithInline, mixedAttachmentAndInline) {
    if (mixedAttachmentAndInline) {                   // if  mixedAttachments+inline
        if (part.mimeType == 'multipart/related') {
            return new Promise(async resolve => {
                var arrayOfMailData = [];
                for (var i = 0; i < part.parts.length; i++) {
                    if (part.parts[i].mimeType != 'multipart/alternative') {
                        if (client) {
                            var data = await googleMailerController.getMultipleInlineImagesArray(messageId, client, part.parts[i]);
                            arrayOfMailData.push(data);
                        }
                    }
                }
                resolve(arrayOfMailData);
            })
        }
        else if (part.mimeType != 'multipart/related') {                    //for attachment in mix type
            return new Promise(async resolve => {
                var mailData = {
                    id: part.body.attachmentId,
                    name: part.filename,
                    contentType: part.mimeType,
                    isInline: false
                };
                if (client) {
                    if (part.mimeType != 'multipart/alternative') {
                        client.users.messages.attachments.get({
                            userId: 'me',
                            id: part.body.attachmentId,
                            messageId: messageId

                        }, (err, result) => {
                            if (err) {
                                throw ({
                                    message: 'Error in fetch attachments',
                                    error: {
                                        status: `Invalid_Request: ${err}.`
                                    }
                                });
                            }

                            var resultOfBytes = result.data.data
                            resultOfBytes = resultOfBytes.replace(/_/g, '/').replace(/-/g, '+')
                            mailData.contentBytes = resultOfBytes;

                            resolve(mailData);
                        });
                    }


                }

            })
        }

    } else {
        return new Promise(async resolve => {

            if (!onlyAttachmentValues) {
                if (part.mimeType == 'multipart/alternative') {
                    var mailData = {};
                    resolve(mailData);
                } else if (part.mimeType == 'multipart/related') {
                    for (var i = 0; i < part.parts.length; i++) {
                        if (part.parts[i].mimeType != 'multipart/alternative') {
                            var mailData = {
                                id: part.parts[i].body.attachmentId,
                                name: part.parts[i].filename,
                                contentType: part.parts[i].mimeType,
                                isInline: true
                            };
                        }
                    }

                    if (client) {
                        for (var i = 0; i < part.parts.length; i++) {
                            if (part.parts[i].mimeType != 'multipart/alternative') {
                                client.users.messages.attachments.get({
                                    userId: 'me',
                                    id: part.parts[i].body.attachmentId,
                                    messageId: messageId

                                }, (err, result) => {
                                    if (err) {
                                        throw ({
                                            message: 'Error in fetch attachments',
                                            error: {
                                                status: `Invalid_Request: ${err}.`
                                            }
                                        });
                                    }

                                    var resultOfBytes = result.data.data
                                    resultOfBytes = resultOfBytes.replace(/_/g, '/').replace(/-/g, '+')
                                    mailData.contentBytes = resultOfBytes;

                                    resolve(mailData);
                                });
                            }
                        }
                    } else {
                        resolve("Invalid client");
                    }
                } else {


                    if (!(onlyAttachmentValues)) {
                        var mailData = {
                            id: part.body.attachmentId,
                            name: part.filename,
                            contentType: part.mimeType,
                            isInline: true
                        };
                    } else {
                        var mailData = {
                            id: part.body.attachmentId,
                            name: part.filename,
                            contentType: part.mimeType
                        };
                    }



                    if (client) {

                        client.users.messages.attachments.get({
                            userId: 'me',
                            id: part.body.attachmentId,
                            messageId: messageId
                        }, (err, result) => {
                            if (err) {
                                throw ({
                                    message: 'Error in fetch attachments()',
                                    error: {
                                        status: `Invalid_Request: ${err}.`
                                    }
                                });
                            }


                            var resultOfBytes = result.data.data
                            resultOfBytes = resultOfBytes.replace(/_/g, '/').replace(/-/g, '+')
                            mailData.contentBytes = resultOfBytes;

                            resolve(mailData);
                        });
                    } else {
                        resolve("Invalid client");
                    }
                }
            }
            else if (onlyAttachmentValues) {                          //for only aTTACHMENTS
                if (part.body.attachmentId != undefined) {
                    var mailData = {
                        id: part.body.attachmentId,
                        name: part.filename,
                        contentType: part.mimeType,
                        isInline: false
                    };
                    if (client) {
                        client.users.messages.attachments.get({
                            userId: 'me',
                            id: part.body.attachmentId,
                            messageId: messageId
                        }, (err, result) => {
                            if (err) {
                                throw ({
                                    message: 'Error in fetch attachments....',
                                    error: {
                                        status: `Invalid_Request: ${err}.`
                                    }
                                });
                            }


                            var resultOfBytes = result.data.data
                            resultOfBytes = resultOfBytes.replace(/_/g, '/').replace(/-/g, '+')
                            mailData.contentBytes = resultOfBytes;

                            resolve(mailData);
                        });
                    } else {
                        resolve("Invalid client");
                    }

                }
                else {
                    resolve("Invalid client");
                }
            }
        });

    }
}

/**
 * parseFullMessage is not route function. 
 * This function used for parse full mail body response thats get from mail server
 * @method parseFullMessage
 * @access public
 * @param message {Object} 
 * @returns  mail {Object} 
 * 
 * 
 * 
 */

googleMailerController.parseFullMessage = function (message) {
    
    var hasAttachmentsWithInline = false;
    var hasAttachmentsValue = false;
    var noAttachments = false;
    var hasInlineImages = false;

    if (message.payload.mimeType == 'multipart/mixed') {
        hasAttachmentsValue = true;
    } else if (message.payload.mimeType == 'multipart/related') {
        hasInlineImages = true;
    } else if (message.payload.mimeType == 'multipart/alternative') {
        noAttachments = true;
    }

    if (message.payload.mimeType == 'multipart/mixed') {
        hasAttachmentsWithInline = false;
    } else {
        hasAttachmentsWithInline = true;
    }



    if (message.payload.parts && message.payload.parts.length > 0) {
        var bodyData = message.payload.parts[0].body.data;
        var hasAttachments = true;
    } else {
        var bodyData = message.payload.body.data;
        var hasAttachments = false;
    }



    var mail = {
        hasInlineImages: hasInlineImages,

        noAttachments: noAttachments,
        hasAttachmentsValue: hasAttachmentsValue,
        hasAttachments: hasAttachments,
        hasAttachmentsWithInline: hasAttachmentsWithInline,
        createdDateTime: null,
        lastModifiedDateTime: null,
        changeKey: null,
        sentDateTime: null,
        from: {


            emailAddress: {
                name: "",
                address: ""
            }
        },
        replyTo: [],
        ccRecipients: [],
        bccRecipients: [],
        body: base64.decode(bodyData)
    };


    var headers = message.payload.headers;

    for (var i = 0; i < headers.length; i++) {
        if (headers[i].name == "Date") {
            mail.sentDateTime = headers[i].value;
        }
        if (headers[i].name == "Date") {
            mail.receivedDateTime = headers[i].value;
        }
        if (headers[i].name == "Subject") {
            mail.subject = headers[i].value;
        }
        if (headers[i].name == "From") {
            mail.from.emailAddress.name = headers[i].value;
            mail.from.emailAddress.address = headers[i].value;
        }
        if (headers[i].name == "Reply-To") {
            let emailAddress = {
                name: headers[i].value,
                address: headers[i].value
            };
            mail.replyTo.push(emailAddress);
        }
        if (headers[i].name == "Cc") {
            let emailAddress = {
                name: headers[i].value,
                address: headers[i].value
            };
            mail.ccRecipients.push(emailAddress);
        }
    }
    mail.sender = mail.from;
    return mail;
}


googleMailerController.getSignature = function (message) { 
    var mailDataOfSignature = {

    };
    if (message.payload.parts) {

        
        for (var h = 0; h < message.payload.parts.length; h++) {
            console.log('------------>>Parts data',message.payload.parts[h]);

            if (message.payload.parts[h]['mimeType'] == 'multipart/alternative') {
                for (var y = 0; y < message.payload.parts[h]['parts'].length; y++) {
                    if (message.payload.parts[h]['parts'][y]['mimeType'] == 'text/html') {
                        console.log('************body.data',message.payload.parts[h]['parts'][y]['body']['data'])
                        var embeded = message.payload.parts[h]['parts'][y]['body']['data'];
                        var test = base64.decode(embeded.replace(/-/g, '+').replace(/_/g, '/'));
                        mailDataOfSignature.signatureURLContent = test;
                    }
                }
            }
             else if (message.payload.parts[h]['mimeType'] == 'text/html') {
                 console.log('888888888',message.payload.parts[h]['mimeType']);
                var embeded = message.payload.parts[h]['body']['data'];
                var test = base64.decode(embeded.replace(/-/g, '+').replace(/_/g, '/'));
                mailDataOfSignature.signatureURLContent = test;
                
            }
        }
    }






    // if (message.payload.parts) {
    //     for (var t = 0; t < message.payload.parts.length; t++) {
    //         if (message.payload.parts[t]['mimeType'] == 'text/html') {
    //             console.log('---------------------->>>......', message.payload.parts[t]['mimeType'])
    //             var embeded = message.payload.parts[t]['body']['data'];

    //             var test = base64.decode(embeded.replace(/-/g, '+').replace(/_/g, '/'));
    //             mailDataOfSignature.signatureURLContent = test;
    //         }
    //     }
    // }
    return mailDataOfSignature
}


/**
 * getFolderDetail is not route function. 
 * This function used for parse fetch mail folder details from mail server
 * @method getFolderDetail
 * @access public
 * @param client {Object} 
 * @param id {String} 
 * @param count {Number}
 * @param callback {Function}
 * @returns  callback {function} 
 * 
 */
googleMailerController.getFolderDetail = async function (client, id) {
    return new Promise(async (resolve) => {
        client.users.labels.get({
            userId: 'me',
            id: id,
        }, async (err, result) => {
            if (err) return resolve('The API returned an error: ' + err);
            const labels = result.data;
            var folder = {
                id: labels.id,
                displayName: labels.name,
                parentFolderId: '',
                childFolderCount: 0,
                unreadItemCount: labels.messagesUnread,
                totalItemCount: labels.messagesTotal
            };
            return resolve(folder);
        });
    });
};


/**
 * getMailDetails is not route function. 
 * This function used for fetch  full mail metadata response thats get from mail server
 * @method getMailDetails
 * @access public
 * @param client {Object} 
 * @param id {String} 
 * @param i {Number}
 * @param callback {Function}
 * @returns  callback {function} 
 * 
 */
googleMailerController.getMailDetails = function (client, id) {
    return new Promise(async resolve => {
        client.users.messages.get({
            userId: 'me',
            id: id,
            format: "metadata"
        }, (err, result) => {
            if (err) return resolve('The API returned an error: ' + err);
            var mail = {
                id: result.data.id,
                isRead: result.data.labelIds[0] == 'UNREAD' ? false : true
            };
            // console.log('&&&&&&&&&&&&&GetMailDetails', result);
            Object.assign(mail, googleMailerController.parseMessage(result.data));
            resolve(mail);
        });
    });
}

/**
 * parseMessage is not route function. 
 * This function used for parse partialy mail body response thats get from mail server
 * @method parseMessage
 * @access public
 * @param message {Object} 
 * @returns  mail {Object} 
 * 
 */
googleMailerController.parseMessage = function (message) {
    var mail = {
        from: {
            emailAddress: {
                name: "",
                address: ""
            }
        }
    };

    var headers = message.payload.headers;
    for (var i = 0; i < headers.length; i++) {
        if (headers[i].name == "Date") {
            mail.receivedDateTime = headers[i].value;
        }
        if (headers[i].name == "Subject") {
            mail.subject = headers[i].value;
        }
        if (headers[i].name == "From") {
            mail.from.emailAddress.name = headers[i].value;
            mail.from.emailAddress.address = headers[i].value;
        }
    }
    return mail;
}


googleMailerController.getMultipleInlineImagesArray = async function (messageId, client, part) {
    return new Promise(async resolve => {
        var mailData = {
            id: part.body.attachmentId,
            name: part.filename,
            contentType: part.mimeType,
            isInline: true
        };
        if (client) {
            //for (var i = 0; i < part.parts.length; i++) {
            if (part.mimeType != 'multipart/alternative') {
                client.users.messages.attachments.get({
                    userId: 'me',
                    id: part.body.attachmentId,
                    messageId: messageId

                }, (err, result) => {
                    if (err) {
                        throw ({
                            message: 'Error in fetch attachments',
                            error: {
                                status: `Invalid_Request: ${err}.`
                            }
                        });
                    }

                    var resultOfBytes = result.data.data
                    resultOfBytes = resultOfBytes.replace(/_/g, '/').replace(/-/g, '+')
                    mailData.contentBytes = resultOfBytes;

                    // console.log('filename isssss', mailData);

                    resolve(mailData);
                });
            }
            // }

        }

    })
}

module.exports = googleMailerController;


