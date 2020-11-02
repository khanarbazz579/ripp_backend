process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const Imap = require('imap');
const inspect = require('util').inspect;
const nodemailer = require("nodemailer");

/**
 * 
 * @param {String} user 
 * @param {String} password 
 * @param {String} host 
 * @param {Number} port 
 * @param {Boolean} tls 
 */
function imapHelper(user, password, host, port, tls, ismtp) {
    var _that = this;
    return new Promise((resolve, reject) => {
        if (!user) {
            return reject("User can't be empty");
        }

        if (!password) {
            return reject("Password can't be empty");
        }
        if (!ismtp) {
            _that.imap = new Imap({
                user: user,
                password: password,
                host: host,
                port: port,
                tls: tls,
                keepalive: false
            });
            _that.imap.once('error', function(err) {
                return reject(err);
            });
            _that.imap.connect();
            return resolve(_that);
        } else {
            _that.smtp = nodemailer.createTransport({
                host: host,
                port: port,
                secure: false,
                auth: {
                    user: user,
                    pass: password
                },
                tls: {
                    ciphers: 'SSLv3'
                }
            });
            resolve(_that.smtp);
        }
    });
}

/**
 * End connection to server
 */
imapHelper.prototype.logout = function() {
    this.imap.end();
}

/**
 * Fetch folders from mail server.
 */
imapHelper.prototype.getFolders = function(hostName) {

    var isOutlookDomainMail;

    var arrayOffFolders = [];
    var _that = this;
    if (hostName.search('gmail.com') != -1) { //for other than gmail account mails
        isOutlookDomainMail = false;
        return new Promise(async (resolve, reject) => {
            _that.imap.once('ready', async function() {
                _that.imap.getBoxes(async function(err, boxes) {
                    folders = _that.imapNestedFolders(boxes);
                    var returnableFolders = [];
                    for (var i = 0; i < folders.length; i++) {
                        if (folders[i]['children'] != null) {
                            for (var k = 0; k < folders[i]['children'].length; k++) {
                                var folderData = await _that.getFormatedFolders(folders[i]['children'][k].name, k, isOutlookDomainMail);
                                var folderStructure = {
                                    id: folderData.data.name,
                                    displayName: folders[i]['children'][k].name,
                                    parentFolderId: folderData.data.name,
                                    childFolderCount: 0,
                                    unreadItemCount: folderData.data.messages.new,
                                    totalItemCount: folderData.data.messages.total,
                                    isGoogleMailAccount: true
                                };
                                returnableFolders.push(folderStructure);
                            }
                        }
                    }
                    resolve(returnableFolders);
                });
            });
        });

    } else { //for outlook
        var _that = this;
        isOutlookDomainMail = true
        return new Promise(async (resolve, reject) => {
            _that.imap.once('ready', async function() {
                _that.imap.getBoxes(async function(err, boxes) {
                    folders = _that.imapNestedFolders(boxes);
                    var returnableFolders = [];
                    for (var i = 0; i < folders.length; i++) {
                        var folderData = await _that.getFormatedFolders(folders[i].name, i, isOutlookDomainMail);
                        var folderStructure = {
                            id: folderData.data.name,
                            displayName: folderData.data.name,
                            parentFolderId: folderData.data.name,
                            childFolderCount: 0,
                            unreadItemCount: folderData.data.messages.new,
                            totalItemCount: folderData.data.messages.total,
                            isGoogleMailAccount: false
                        };
                        returnableFolders.push(folderStructure);
                    }
                    resolve(returnableFolders);
                });
            });
        });
    }

};

/**
 * @param folder {Array}
 * @param count {Number}
 * @returns Promise {Object}
 */
imapHelper.prototype.getFormatedFolders = async function(folders, count) {
    var _that = this;
    return new Promise(async (resolve, reject) => {
        _that.imap.openBox(folders, (err, result) => {
            if (err) {
                reject(err, count);
            } else {
                resolve({ data: result, count: count });
            }
        })
    });
};

/**
 * @param folders {Array}
 * @return FOLDERS {Array}
 */
imapHelper.prototype.imapNestedFolders = function(folders) {
    var FOLDERS = [];
    var folder = {};
    for (var key in folders) {
        if (folders[key].attribs.indexOf('\\HasChildren') > -1) {
            var children = this.imapNestedFolders(folders[key].children);
            folder = {
                name: key,
                children: children
            };
        } else {
            folder = {
                name: key,
                children: null
            };
        }
        FOLDERS.push(folder);
    }
    return FOLDERS;
};

/**
 * @param folder {String}
 * @param offset {Number}
 * @param limit {Number}
 * @returns Promise {Object}
 */
imapHelper.prototype.getMessages = function(folder, offset, limit) {
    var _that = this;
    limit = limit == 0 ? 1 : limit;
    offset = offset == 1 ? 0 : offset;
    return new Promise((resolve, reject) => {
        _that.imap.once('ready', function() {
            _that.imap.openBox(folder, true, function(err, box) {

                if (err) {
                    return reject(err);
                }

                if (box.messages.total === 0) {
                    return resolve([]);
                }

                if (box.messages.total === offset) {
                    offset = offset - 1;
                }
                if (box.messages.total < offset) {
                    resolve([]);
                }
                var limitD = box.messages.total - offset - limit < 0 ? 1 : box.messages.total - offset - limit + 1;
                var f = _that.imap.seq.fetch(`${box.messages.total - offset}:${limitD}`, {
                    bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                    struct: false
                });
                var messages = [];
                f.on('message', function(msg, seqno) {

                    msg.on('body', function(stream) {
                        var buffer = '';
                        stream.on('data', function(chunk) {
                            buffer += chunk.toString('utf8');
                            stream.once('end', function() {
                                if (Imap.parseHeader(buffer)) {
                                    messages[seqno - 1] = Imap.parseHeader(buffer);
                                    messages[seqno - 1].seqno = seqno;
                                }
                            });
                        });
                        msg.once('attributes', function(attrs) {
                            if (attrs) {

                                messages[seqno - 1].attrs = attrs;
                            }
                        });
                    });
                });
                f.on('end', function() {
                    messages = _that.getFormatedMessages(messages);
                    resolve(messages);
                });
            });
        });
    });
};

/**
 * @param mailBox {String}
 * @param mailId {Number}
 * @return Promise {Object}
 */
imapHelper.prototype.getMailById = function(mailBox, mailId) {
    var _that = this;
    return new Promise((resolve, reject) => {
        _that.imap.once('ready', function() {
            _that.imap.openBox(mailBox, true, function(err, box) {
                if (err) {
                    return reject(err);
                }
                var f = _that.imap.seq.fetch(mailId, { bodies: '', struct: true });
                var messages = [];
                f.on('message', function(msg, seqno) {
                    msg.on('body', function(stream) {
                        var buffer = '';
                        stream.on('data', function(chunk) {

                            buffer += chunk.toString('utf8');
                            stream.once('end', function() {
                                if (Imap.parseHeader(buffer)) {
                                    messages[seqno - 1] = Imap.parseHeader(buffer);
                                    messages[seqno - 1].seqno = seqno;
                                }
                            });
                        });
                        msg.once('attributes', function(attrs) {
                            if (attrs) {
                                messages[seqno - 1].attrs = attrs;
                            }
                        });
                    });
                });
                f.on('end', function() {
                    messages = _that.getFormatedMessages(messages, true);
                    resolve(messages);
                });
            });
        });
    });
};

/**
 * @param messages {Array}
 * @param isFull {Boolean}
 * @returns formatedMessagesList {Array}
 */
imapHelper.prototype.getFormatedMessages = async function(messages, isFull) {

    var formatedMessagesList = [];
    for (var i = 0; i < messages.length; i++) {
        if (messages[i]) {
            var message = {
                id: messages[i].seqno,
                subject: (typeof messages[i].subject == 'object' && messages[i].subject.length > 0) ? messages[i].subject[0] : '',
                receivedDateTime: messages[i].date ? messages[i].date[0] : null,
            };
            if (messages[i].attrs.flags.length > 0 && messages[i].attrs.flags.indexOf('\\Seen') > -1) {
                message.isRead = true;
            } else {
                message.isRead = false;
            }
            if (messages[i].from) {
                message.from = {
                    emailAddress: {
                        name: messages[i].from[0],
                        address: messages[i].from[0]
                    }
                };
            }
            if (isFull) {
                var _that = this;
                message.lastModifiedDateTime = messages[i].date ? messages[i].date[0] : null;
                message.changeKey = '';
                message.categories = messages[i].attrs.flags;
                message.sentDateTime = messages[i].date ? messages[i].date[0] : null;
                message.hasAttachments = messages[i].attrs.struct.length > 1 ? true : false;
                messages.internetMessageId = messages[i]['message-id'] ? messages[i]['message-id'][0] : null;
                messages.bodyPreview = null;
                message.importance = null;
                message.parentFolderId = null;
                message.conversationId = messages[i]['message-id'] ? messages[i]['message-id'][0] : null;
                message.isDeliveryReceiptRequested = null;
                message.isReadReceiptRequested = null;
                message.isDraft = null;
                message.webLink = null;
                if (messages[i].from) {
                    message.sender = {
                        emailAddress: {
                            name: messages[i].from[0],
                            address: messages[i].from[0]
                        }
                    };
                }
                if (messages[i].to) {
                    message.toRecipients = [];
                    let messagesList = messages[i].to[0];
                    messagesList = messagesList.split(",");
                    for (let i = 0; i < messagesList.length; i++) {
                        message.toRecipients.push({
                            name: messagesList[i],
                            address: messagesList[i]
                        });
                    }
                }
                if (messages[i].cc) {
                    message.ccRecipients = [];
                    let messagesList = messages[i].cc[0];
                    messagesList = messagesList.split(",");
                    for (let i = 0; i < messagesList.length; i++) {
                        message.ccRecipients.push({
                            name: messagesList[i],
                            address: messagesList[i]
                        });
                    }
                }
                if (messages[i].bcc) {
                    message.bccRecipients = [];
                    let messagesList = messages[i].bcc[0];
                    messagesList = messagesList.split(",");
                    for (let i = 0; i < messagesList.length; i++) {
                        message.bccRecipients.push({
                            name: messagesList[i],
                            address: messagesList[i]
                        });
                    }
                }
                message.body = {
                    "contentType": "text",
                    "content": ""
                };

                message.attachments = [];
                let messageIndex = -1;

                if (messages[i].attrs.struct && messages[i].attrs.struct.length > 1) {
                    for (let x = 0; x < messages[i].attrs.struct.length; x++) {
                        let innerStruct = messages[i].attrs.struct[x];
                        if (innerStruct && innerStruct.length > 0) {
                            for (let k = 0; k < innerStruct.length; k++) {
                                if (innerStruct[k] && innerStruct[k].partID && innerStruct[k].subtype == 'html') {
                                    messageIndex = innerStruct[k].partID;
                                }
                                if (messageIndex == -1) {
                                    if (innerStruct[k] && innerStruct[k].length > 1 && innerStruct[k][1]) {
                                        messageIndex = innerStruct[k][1].partID;
                                    } else if (innerStruct[k][0]) {
                                        messageIndex = innerStruct[k][0].partID;
                                    }
                                }
                            }
                            if (innerStruct[0].disposition && innerStruct[0].disposition.type == 'ATTACHMENT') {
                                message.attachments.push({
                                    content_type: innerStruct[0].type + '/' + innerStruct[0].subtype,
                                    name: innerStruct[0].disposition.params.filename,
                                    id: innerStruct[0].partID
                                })
                            }
                        }
                    }
                }

                message.body.content = getHtml(await _that.getMailBody(messages[i].seqno, messageIndex > -1 ? messageIndex : 2));
                if (!message.body.content || message.body.content == null || message.body.content == 'null') {
                    message.body.content = await _that.getMailBody(messages[i].seqno, 1);
                }
            }
            formatedMessagesList.push(message);
        }
    }
    return formatedMessagesList;
}


function getHtml(l) {
    var j = String.fromCharCode;
    return l.replace(/[\t\x20]$/gm, "").replace(/=?(?:\r\n?|\n)/g, "").replace(/=([a-fA-F0-9]{2})/g, function(n, m) {
        var o = parseInt(m, 16);
        return j(o)
    })
}

/**
 * @param seqid {Number}
 * @return Promise {Object}
 */
imapHelper.prototype.getMailBody = async function(seqid, index) {
    var _that = this;
    return new Promise(async resolve => {
        var f = _that.imap.seq.fetch(seqid, { bodies: [index], struct: false });
        f.on('message', function(msg, seqno) {
            msg.on('body', function(stream, info) {
                var buffer = '';
                stream.on('data', function(chunk) {
                    buffer += chunk.toString('utf8');
                    stream.once('end', function() {
                        if (Imap.parseHeader(buffer)) {
                            resolve(buffer.toString());
                        }
                    });
                });
            });
        });
    })
};

/**
 * @param struct {Array}
 * @param attachments {Array}
 * @returns attachments {Array}
 */
imapHelper.prototype.findAttachmentParts = function(struct, attachments) {
    attachments = attachments || [];
    for (var i = 0, len = struct.length, r; i < len; ++i) {
        if (Array.isArray(struct[i])) {
            this.findAttachmentParts(struct[i], attachments);
        } else {
            if (struct[i].disposition) {
                attachments.push(struct[i]);
            }
        }
    }
    return attachments;
}

/**
 * @param mailBox {String}
 * @param mailId {Number}
 * @return Promise {Object}
 */
imapHelper.prototype.getAttachment = async function(mailBox, mailId) {
    var _that = this;
    return new Promise((resolve, reject) => {
        _that.imap.once('ready', function() {
            _that.imap.openBox(mailBox, true, function(err, box) {
                if (err) {
                    return reject(err);
                }
                var f = _that.imap.seq.fetch(mailId, { bodies: '', struct: true });
                var attachmentsList = [];
                f.on('message', function(msg, seqno) {
                    msg.on('body', function(stream) {
                        msg.once('attributes', async function(attrs) {
                            var attachments = _that.findAttachmentParts(attrs.struct);
                            for (var i = 0, len = attachments.length; i < len; ++i) {
                                var attachment = attachments[i];
                                var fileData = await _that.getFileData(attrs, attachment);
                                attachmentsList.push({
                                    id: attachment.id,
                                    name: attachment.params.name,
                                    contentType: attachment.type + '/' + attachment.subtype,
                                    size: attachment.size,
                                    contentBytes: fileData
                                });
                            }
                            resolve(attachmentsList);
                        });
                    });
                });
            });
        });
    });
};

/**
 * @param attrs {Object}
 * @param attachment {Array}
 * @returns Promise {Object}
 */
imapHelper.prototype.getFileData = async function(attrs, attachment) {
    var _that = this;
    return new Promise(async (resolve) => {
        var fa = _that.imap.fetch(attrs.uid, {
            bodies: [attachment.partID],
            struct: true
        });
        fa.on('message', function(msg, seqno) {
            msg.on('body', function(stream, info) {
                var buffer = '';
                stream.on('data', function(chunk) {
                    buffer += chunk.toString('utf8');
                    stream.once('end', function() {
                        if (Imap.parseHeader(buffer)) {
                            resolve(buffer.toString());
                        }
                    });
                });
            });
        });
    })
}

/**
 * @param mailBox {String}
 * @param mailId {Number}
 * @param flag {Boolean}
 * @returns Promise {Object}
 */
imapHelper.prototype.updateEmail = function(mailbox, mailId, flage) {
    var _that = this;
    return new Promise(async resolve => {
        _that.imap.once('ready', function() {
            _that.imap.openBox(mailbox, false, function(err, box) {
                if (err) {
                    return reject(err);
                }
                var f = _that.imap.seq.fetch(mailId, {
                    bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                    struct: false
                });
                f.on('message', function(msg, seqno) {
                    msg.once('attributes', function(attrs) {
                        if (attrs) {
                            if (flage) {
                                _that.imap.addFlags(attrs.uid, ["Seen"], function(err) {
                                    if (!err) {
                                        resolve("marked as read");
                                    } else {
                                        reject(JSON.stringify(err, null, 2));
                                    }
                                });
                            } else {
                                _that.imap.delFlags(attrs.uid, ["Seen"], function(err) {
                                    if (!err) {
                                        resolve("marked as unread");
                                    } else {
                                        reject(JSON.stringify(err, null, 2));
                                    }
                                });
                            }
                        }
                    });
                });
            })
        });
    });
};

/**
 * @param mailId {Number}
 * @param fromMailBox {String}
 * @param destinationMailbox {String}
 * @param isMove {Boolean}
 * @returns Promise {Object}
 */
imapHelper.prototype.copyMoveEmail = function(mailId, fromMailBox, destinationMailbox, isMove) {
    var _that = this;
    return new Promise((resolve, reject) => {
        if (typeof mailId != 'object') {
            mailId = [mailId];
        }
        for (let i = 0; i < mailId.length; i++) {
            _that.moveCopyEmailProcess(mailId, fromMailBox, destinationMailbox, isMove, i, number => {
                if (number == mailId.length - 1) {
                    if (isMove) {
                        resolve("Email successfully moved");
                    } else {
                        resolve("Email successfully copied");
                    }
                }
            });
        }

    });
}

imapHelper.prototype.moveCopyEmailProcess = async function(mailId, fromMailBox, destinationMailbox, isMove, i, callback) {
    var _that = this;
    _that.imap.once('ready', async function() {
        _that.imap.openBox(fromMailBox, false, async function(err, box) {
            if (err) {
                return callback(i);
            }
            if (isMove) {
                _that.imap.seq.move(mailId, destinationMailbox, async function(err) {
                    callback(i);

                });
            } else {
                _that.imap.seq.copy(mailId, destinationMailbox, async function(err) {
                    callback(i);
                });
            }
        });
    });
}

/**
 * @param mailId {Number}
 * @param fromMailBox {String}
 * @param destinationMailbox {String}
 * @param isMove {Boolean}
 * @returns Promise {Object}
 */
imapHelper.prototype.saveEmail = function(message) {
    var _that = this;
    return new Promise((resolve, reject) => {
        _that.imap.once('ready', function() {
            _that.imap.openBox('Drafts', false, function(err, box) {
                if (err) {
                    return reject(err);
                }
                _that.imap.append(message);
                resolve("Email Created");
            });
        });
    });
}

/**
 * @param text {String}
 * @return searchOptions {Array}
 */
imapHelper.prototype.makeSearchString = function(text) {
    var searchOptions = [];
    var headText = ['from', 'to', 'cc', 'bcc', 'subject', 'body'];
    if (text.includes(":")) {
        var formatedText = text.split(":");
        if (formatedText.length > 1) {
            if (headText.indexOf(formatedText[0].toLowerCase()) > -1) {
                searchOptions.push([formatedText[0], formatedText[1]]);
            } else {
                searchOptions.push(["BODY", text]);
            }
        } else {
            searchOptions.push(["BODY", formatedText[0]]);
        }
    } else {
        searchOptions.push(["BODY", text]);
    }
    return searchOptions;
}

/**
 * @param searchText {Any}
 * @return Promise Object
 */
imapHelper.prototype.searchEmails = function(mailBox, searchText) {
    var _that = this;
    return new Promise((resolve, reject) => {
        try {
            _that.imap.once('ready', function() {
                _that.imap.openBox('INBOX', false, function(err, box) {
                    if (err) {
                        return reject(err);
                    }
                    searchText = _that.makeSearchString(searchText);
                    _that.imap.search(searchText, function(err, result) {

                        if (err) {
                            return reject(err);
                        }
                        if (result.length < 1) {
                            return resolve([]);
                        }

                        var f = _that.imap.seq.fetch(result, {
                            bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                            struct: false
                        });
                        var messages = [];
                        f.on('message', function(msg, seqno) {
                            msg.on('body', function(stream) {
                                var buffer = '';
                                stream.on('data', function(chunk) {
                                    buffer += chunk.toString('utf8');
                                    stream.once('end', function() {
                                        if (Imap.parseHeader(buffer)) {
                                            messages[seqno - 1] = Imap.parseHeader(buffer);
                                            messages[seqno - 1].seqno = seqno;
                                        }
                                    });
                                });
                                msg.once('attributes', function(attrs) {
                                    if (attrs) {
                                        messages[seqno - 1].attrs = attrs;
                                    }
                                });
                            });
                        });
                        f.on('end', function() {
                            messages = _that.getFormatedMessages(messages);
                            resolve(messages);
                        });
                    });
                });
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * @param folder {Array}
 * @param count {Number}
 * @returns Promise {Object}
 */
imapHelper.prototype.getFormatedFolders = async function(folders, count, isOutlookDomainMail) {

    if (isOutlookDomainMail == false) {
        folders = '[Gmail]/' + folders

    }

    var _that = this;
    return new Promise(async (resolve, reject) => {
        _that.imap.openBox(folders, (err, result) => {
            if (err) {
                reject(err, count);
            } else {
                resolve({ data: result, count: count });
            }
        })
    });
};

/**
 * @param folders {Array}
 * @return FOLDERS {Array}
 */
// imapHelper.prototype.imapNestedFolders = function(folders) {
//     var FOLDERS = [];
//     var folder = {};
//     for (var key in folders) {
//         if (folders[key].attribs.indexOf('\\HasChildren') > -1) {
//             var children = this.imapNestedFolders(folders[key].children);
//             folder = {
//                 name: key,
//                 children: children
//             };
//         } else {
//             folder = {
//                 name: key,
//                 children: null
//             };
//         }
//         FOLDERS.push(folder);
//     }
//     return FOLDERS;
// };

/**
 * @param folder {String}
 * @returns Promise {Object}
 */
imapHelper.prototype.getUnreadMessages = function(folder) {
    var _that = this;
    return new Promise((resolve, reject) => {
        _that.imap.once('ready', function() {
            _that.imap.openBox(folder, false, function(err, box) {
                if (err) {
                    return reject(err);
                }
                _that.imap.search(['ALL', ['SINCE', 'May 20, 2010']], function(err, results) {
                    if (results.length === 0)
                        return resolve([]);
                    var f = _that.imap.fetch(results, {
                        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
                        struct: true,
                        markSeen: true
                    })
                    var messages = [];
                    f.on('message', function(msg, seqno) {
                        msg.on('body', function(stream) {
                            var buffer = '';
                            stream.on('data', function(chunk) {
                                buffer += chunk.toString('utf8');
                                stream.once('end', function() {
                                    if (Imap.parseHeader(buffer)) {
                                        messages[seqno - 1] = Imap.parseHeader(buffer);
                                        messages[seqno - 1].seqno = seqno;
                                    }
                                });
                            });
                            msg.once('attributes', function(attrs) {
                                if (attrs) {
                                    messages[seqno - 1].attrs = attrs;
                                }
                            });
                        });
                    });
                    f.on('end', function() {
                        messages = _that.getFormatedMessages(messages, true);
                        resolve(messages);
                    });
                });
            });
        });
    });
};

imapHelper.prototype.getMailAttachment = async function(mailbox, mailId, partID) {
    var _that = this;
    return new Promise(async (resolve,reject) => {
        _that.imap.once('ready', async function() {
            _that.imap.openBox(mailbox, false, function(err, box) {
                if (err) {
                    return reject(err);
                }
                var fa = _that.imap.seq.fetch(mailId, {
                    bodies: [partID],
                    struct: true
                });
                fa.on('message', function(msg, seqno) {
                    msg.on('body', function(stream, info) {
                        var buffer = '';
                        stream.on('data', function(chunk) {
                            buffer += chunk;
                            stream.once('end', function() {
                                if (Imap.parseHeader(buffer)) {
                                    resolve(buffer.toString('base64'));
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}



/**
 * @param searchText {Any}
 * @return Promise Object
 */
 imapHelper.prototype.fetchEmailInThread = function(mailBox, searchText) {
    var _that = this;
    return new Promise((resolve, reject) => {
        try {
                _that.imap.openBox(mailBox, false, function(err, box) {
                    if (err) {
                        return reject(err);
                    }
                    _that.imap.search(searchText, function(err, result) {
                        if (err) {
                            return reject(err);
                        }
                        if (result.length < 1) {
                            return resolve([]);
                        }
                        var f = _that.imap.fetch(result, {
                            bodies: '',
                            struct: true
                        });
                        var messages = [];
                        f.on('error', function(err) {
                             return reject(err);
                        })
                        f.on('message', function(msg, seqno) {
                            msg.on('body', function(stream) {
                                var buffer = '';
                                stream.on('data', function(chunk) {
                                    buffer += chunk.toString('utf8');
                                    stream.once('end', function() {
                                        if (Imap.parseHeader(buffer)) {
                                            messages[seqno - 1] = Imap.parseHeader(buffer);
                                            messages[seqno - 1].seqno = seqno;
                                        }
                                    });
                                });
                                msg.once('attributes', function(attrs) {
                                    if (attrs) {
                                        messages[seqno - 1].attrs = attrs;
                                    }
                                });
                            });
                        });
                        f.on('end', async function() {
                            messages = await _that.getFormatedMessages(messages, true);
                            resolve(messages);
                        });
                    });
                });
        } catch (err) {
            reject(err);
        }
    });
}
module.exports = imapHelper;