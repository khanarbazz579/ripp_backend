const authHelper = require("./../../helpers/authHelper");
const { credentials, authForData } = require('./../../config/outlookmailapp');
var graph = require('@microsoft/microsoft-graph-client');
let outlookMailerController = {};
const auth = new authHelper(credentials, authForData);

outlookMailerController.mailer = async function (req, res) {
  res.send(`<a class="btn btn-primary btn-large"  href="javascript:window.open('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&amp;client_id=6c2e2bf1-fc23-4c2f-87ee-9934b6f0137a&amp;redirect_uri=http://localhost:3000/api/mailer/authorize&amp;scope=openid%20profile%20offline_access%20User.Read%20Mail.ReadWrite%20Mail.Send%20Calendars.Read%20Contacts.Read','popup',width=300,height=300);">Click here to login</a>`);
}

/**
 * After send authontication request to Microsoft server with
 * scopes Microsoft server redirect on this route with parameters and tokens
 * in this route validate provided auth code is valid or not.
 * If valid then generate auth token and store in database. otherwise send error response.
 * @module outlookMailerController
 * @method authorize
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.code {String} {Code that's returns from Microsoft server in query string.}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
outlookMailerController.authorize = async function (req, res, next) {
  const code = req.query.code;
  let parms = {};
  if (code) {
    let token;
    try {
      token = await auth.getTokenFromCode(code, res, req.connection.remoteAddress);
      if (token) {
        res.send(`<script> setTimeout(function(){
          window.close();
      },1000);</script>`);
      } else {
        throw ({ code: "Invalid_Request", message: "Genrated request not found." });
      }
    } catch (err) {
      parms.message = 'Error in authontiocation';
      parms.error = { status: `${err.code}: ${err.message}` };
      return res.json(parms);
    }
  } else {
    parms.message = 'Error in authontiocation';
    parms.error = { status: `Invalid_Request: Genrated request not found.` };
    return res.json(parms);
  }
};

outlookMailerController.refresh = async function (req, res, next) {
  auth.refresh();
  res.json({ status: 'Success' }).status(200);
}

/**
 * getFolders is responsible for fetch all types of email folders from Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for fetch email folders. Otherwise send error response.
 * @module outlookMailerController
 * @method getFolders
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
outlookMailerController.getFolders = async function (req, res) {
  const userName = req.body.graph_user_name;
  const accessToken = await auth.getAccessToken(userName);
  let parms = {};
  if (accessToken) {
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`me/MailFolders`).get();
      res.json(result.value);
    } catch (err) {
      parms.message = 'Error in fetch folders';
      parms.error = { status: `${err.code}: ${err.message}` };

    }
  } else {
    parms.message = 'Error in fetch folders';
    parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
    return res.json(parms);
  }
};



outlookMailerController.getFoldersMailCount = async function (req, res) {
  const userName = req.body.graph_user_name;
  const accessToken = await auth.getAccessToken(userName);
  let parms = {};
  if (accessToken) {
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`me/MailFolders`)
        .select('totalItemCount', 'displayName', 'id')
        .get()

      res.json(result.value);
    } catch (err) {
      parms.message = 'Error in fetch folders';
      parms.error = { status: `${err.code}: ${err.message}` };

    }
  } else {
    parms.message = 'Error in fetch folders';
    parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
    return res.json(parms);
  }
};
/**
 * getMail is responsible for fetch folder wise emails from Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for fetch emails. Otherwise send error response.
 * @module outlookMailerController
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
outlookMailerController.getMail = async function (req, res) {
  let parms = {};
  const userName = req.body.graph_user_name;
  const limit = req.body.limit || 10;
  const offset = req.body.offset || 0;
  const folder = req.body.folder_id || "inbox";
  const orderBy = req.body.orderby || 'receivedDateTime DESC';
  let filter = req.body.filter || "conversationId  eq 'AQQkADAwATY3ZmYAZS1jNzZkLThiNGUtMDACLTAwCgAQAL7ltPV1XsJHsBMjrLBVr98='";
  const accessToken = await auth.getAccessToken(userName);
  if (accessToken) {
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      console.log("==================>", folder);
      const result = await client
        .api(`/me/mailfolders/${folder}/messages`)
        .top(limit)
        .skip(offset)
        //.select('subject,from,receivedDateTime,isRead')
        .orderby(orderBy)
        // .filter(filter)
        .get();

      res.json({
        mails: result.value,
        offset: offset + limit
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
};

outlookMailerController.getMailToSelectAllForOutlook = async function (req, res) {
  let parms = {};
  const userName = req.body.graph_user_name;
  const limit = req.body.limit || 5;
  const offset = req.body.offset || 0;
  const folder = req.body.folder_id || "inbox";
  const orderBy = req.body.orderby || 'receivedDateTime DESC';
  let filter = req.body.filter || '';
  const accessToken = await auth.getAccessToken(userName);
  if (accessToken) {
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`/me/mailfolders/${folder}/messages`)
        .top(limit)
        .skip(offset)
        .select('id')
        .orderby(orderBy)
        .filter(filter)
        .get();
      res.json({
        mails: result.value,
        offset: offset + limit
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
};







/**
 * getMailById is responsible for fetch perticular email by unique id from Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for fetch email. Otherwise send error response.
 * @module outlookMailerController
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
outlookMailerController.getMailById = async function (req, res) {
  let parms = {};
  const userName = req.body.graph_user_name;
  const mailId = req.body.mail_id;
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`me/messages/${mailId}`)
        .get();


      res.json(result);
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
 * updateMail is responsible for update perticular email by unique id on Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for fetch email. Otherwise send error response.
 * @module outlookMailerController
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
outlookMailerController.updateMail = async function (req, res) {
  let parms = {};
  let body = {};
  const userName = req.body.graph_user_name;
  const mailId = req.body.mail_id;
  const accessToken = await auth.getAccessToken(userName)
  if (req.body.isRead !== undefined) {
    body.isRead = req.body.isRead;
  }
  if (req.body.category !== undefined && req.body.category.length > 0) {
    body.Categories = req.body.category;
  }
  if (accessToken) {
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      await client
        .api(`/me/messages/${mailId}/`).patch(body);
      res.json({ status: "Success", message: "Mail successfully updated." });
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
 * moveOrCopyMail is responsible for move or copy perticular email by unique id on Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for fetch email. Otherwise send error response.
 * @module outlookMailerController
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
outlookMailerController.moveOrCopyMail = async function (req, res) {
  let parms = {};
  const userName = req.body.graph_user_name;
  const mailId = req.body.mail_id;
  const action = req.body.action;
  const destinationId = req.body.destination_id;
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    parms.user = userName;
    // graph.BatchRequestContent
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      for (let i = 0; i < mailId.length; i++) {
        const result = await client
          .api(`/me/messages/${mailId[i]}/${action}/`).post({ DestinationId: destinationId });
      }
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
  //parallelBatching(req,res);
};

/**
 * sendMail is responsible for send email with attachment or without attachment by Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for send email. Otherwise send error response.
 * @module outlookMailerController
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
outlookMailerController.sendMail = async function (req, res) {
  let parms = {};
  let mailData = req.body.mail;
  const userName = req.body.graph_user_name;
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    parms.user = userName;
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`/me/sendmail`).post(mailData);
      res.json({ status: "Success", message: "Mail successfully sent." });
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
 * saveDraft is responsible for save  email with attachment or without attachment by Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for fetch email. Otherwise send error response.
 * @module outlookMailerController
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
 * @param req.isAll {Boolean} {Optional}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 * 
 */
outlookMailerController.saveDraft = async function (req, res) {
  let parms = {};
  let mailData = req.body.mail.message;
  const userName = req.body.graph_user_name;
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    parms.user = userName;
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`/me/MailFolders/drafts/messages`).post(mailData);
      res.json({ status: "Success", message: "Mail successfully saved." });
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
 * replayMail is responsible for send reply email with attachment or without attachment by Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for send reply email. Otherwise send error response.
 * @module outlookMailerController
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
outlookMailerController.replayMail = async function (req, res) {
  let parms = {};
  let mailData = req.body.mail;
  const userName = req.body.graph_user_name;
  const mailId = req.body.mail_id;
  const replyTo = req.body.isAll ? "replyall" : "reply";
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    parms.user = userName;
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`/me/messages/${mailId}/${replyTo}`).post(mailData);
      res.json({ status: "Success", message: "Mail successfully sent." });
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
 * createReplyMail is responsible for send reply email with attachment or without attachment by Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for save reply email. Otherwise send error response.
 * @module outlookMailerController
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
outlookMailerController.createReplyMail = async function (req, res) {
  let parms = {};
  let mailData = req.body;
  const userName = req.body.graph_user_name;
  const mailId = req.body.mail_id;
  const replyTo = req.body.isAll ? "createreplyall" : "createreply";
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    parms.user = userName;
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`/me/messages/${mailId}/${replyTo}`).post(mailData);
      res.json({ status: "Success", message: "Mail successfully saved." });
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
 * getAttachment is responsible for get attachment from Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for fetch email attachment. Otherwise send error response.
 * @module outlookMailerController
 * @method getAttachment
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.mail_id {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
outlookMailerController.getAttachmentWithContentBytes = async function (req, res) { ////API calling to disply attachmentsAPI calling to disply attachments
  const userName = req.body.graph_user_name;
  const mailId = req.body.mail_id;
  const attachmentId = req.body.attachmentId
  let parms = {};
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    parms.user = userName;
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    try {

      const emailDetailsWithContentBytes = await client
        //.api(`/me/messages('${mailId}')/attachments`).get();
        .api(`me/messages('${mailId}')/attachments('${attachmentId}')`).get();

      res.json(emailDetailsWithContentBytes);
    } catch (err) {

      parms.message = 'Error in fetch attachment^^^^^^^^^^^^';
      parms.error = { status: `${err.code}: ${err.message}` };
      res.json(parms);
    }
  } else {
    parms.message = 'Error in fetch attachment............';
    parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
    return res.json(parms);
  }
};

outlookMailerController.getAttachmentToGetContentData = async function (req, res) {           //API calling to disply attachments
  const userName = req.body.graph_user_name;
  const mailId = req.body.mail_id;
  let parms = {};
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    parms.user = userName;
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result1 = await client
        .api(`/me/messages('${mailId}') `).get();
      res.json(result1.value);
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
 * forwordMail is responsible for forword email with attachment or without attachment by Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for forword email. Otherwise send error response.
 * @module outlookMailerController
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
outlookMailerController.forwordMail = async function (req, res) {
  const userName = req.body.graph_user_name;
  const mailId = req.body.mail_id;
  let mailData = req.body.mail.message;
  let parms = {};
  const accessToken = await auth.getAccessToken(userName)
  if (accessToken) {
    parms.user = userName;
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {
      const result = await client
        .api(`/me/messages/${mailId}/forward`).post(mailData);
      res.json({ status: "Success", message: "Mail successfully forword." });
    } catch (err) {
      parms.message = 'Error in mail forwording';
      parms.error = { status: `${err.code}: ${err.message}` };
      res.json(parms);
    }
  } else {
    parms.message = 'Error in email forwording';
    parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
    return res.json(parms);
  }
};

/**
 * searchMail is responsible for search email by query params from Microsoft server.
 * In this route first check token is exist or not if token exist then send 
 * request to Microsoft server for search emails. Otherwise send error response.
 * @module outlookMailerController
 * @method getAttachment
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param req.provider {String} {Required}
 * @param req.search_text {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
outlookMailerController.searchMail = async function (req, res) {
  let parms = {};
  const userName = req.body.graph_user_name;
  const searchText = req.body.search_text;

  //attachments?$select=Name
  ///attachments('${attachmentId}')`).get();
  const accessToken = await auth.getAccessToken(userName);
  const offset = req.body.offset || 0;
  if (accessToken) {
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    try {

      const result = await client
        //me/mailfolders/inbox/messages?$search=%22test%22
        //.api(`me/messages('${mailId}')/attachments('${attachmentId}')`).get();
        //https://outlook.office.com/api/v2.0/me/mailfolders/inbox/messages?$search=%22test%22
        .api(`me/mailfolders/inbox/messages?$search=%22('${searchText}%22`).get();
      // .select('subject,from,receivedDateTime,isRead')
      // .top(10)
      // .skip(offset)
      // .search(`'${searchText}'`)

      res.json({
        mails: result.value,
        //offset: offset + limit
      });
    } catch (err) {

      parms.message = 'Error in email searching';
      parms.error = { err };
      res.json(parms);
    }
  } else {
    parms.message = 'Error in email searching';
    parms.error = { status: `Invalid_Token: Token may be expire. Generate new token.` };
    return res.json(parms);
  }
};

/**
 * generateRequest is responsible for create authontication request.
 * @module outlookMailerController
 * @method generateRequest
 * @access public
 * @param req {Object} {Request parameter that contain request headers}
 * @param req.graph_user_name {String} {Required}
 * @param res {Object} {Resonse parameter that contain response headers}
 * @returns {Object} {Response object, If throw any errors then send error status otherwise send success status with data }
 */
outlookMailerController.generateRequest = async function (req, res) {
  let parms = {};
  const userName = req.body.graph_user_name;
  const clearExistToken = null; // await auth.checkTokenExist(userName);
  if (!clearExistToken) {
    const isTokenRequest = await auth.createTokenRequest(userName, req.connection.remoteAddress,req.user.id);
    if (isTokenRequest) {
      res.json({
        status: "Success",
        message: "Auth request successfully created.",
        url: await auth.getAuthUrl()
      });
    } else {
      parms.message = 'Error in request generate';
      parms.error = { status: `Server_Error: Inetrnal server error.` };
      return res.json(parms);
    }
  } else {
    res.json({
      status: "Success",
      message: "Auth request successfully created.",
      url: await auth.getAuthUrl(),
      alive: true,
    })
  }
}


//  async function parallelBatching(req,res) {

//   console.log(req.body.req.body.mail_id);


// 	try {
// 		let fileName = "test.pdf";
// 		let oneDriveFileRequest = new Request(`/me/drive/root:/${fileName}:/content`, {
// 			method: "GET",
// 		});

// 		let oneDriveFileStep: BatchRequestStep = {
// 			id: "1",
// 			request: oneDriveFileRequest,
// 		};

// 		let folderDetails = {
// 			name: "Testing Batch",
// 			folder: {},
// 		};
// 		let createFolder = new Request("/me/drive/root/children", {
// 			method: "POST",
// 			headers: {
// 				"Content-type": "application/json",
// 			},
// 			body: JSON.stringify(folderDetails),
// 		});

// 		let createFolderStep: BatchRequestStep = {
// 			id: "2",
// 			request: createFolder,
// 			dependsOn: ["1"],
// 		};

// 		let mailsRequest = new Request("/me/messages", {
// 			method: "GET",
// 		});

// 		let mailsRequestStep: BatchRequestStep = {
// 			id: "3",
// 			request: mailsRequest,
// 			dependsOn: ["2"],
// 		};

// 		//Create instance by passing a batch request step
// 		let batchRequestContent = new MicrosoftGraph.BatchRequestContent();

// 		// Dynamically adding requests to the batch content
// 		let fileDownloadId = batchRequestContent.addRequest(oneDriveFileStep);

// 		let createFolderId = batchRequestContent.addRequest(createFolderStep);

// 		let mailsId = batchRequestContent.addRequest(mailsRequestStep);

// 		// Dynamically removing unnecessary dependencies
// 		// NOTE: Passing second param empty removes all the dependencies for that request
// 		batchRequestContent.removeDependency("3", "2");

// 		// Dynamically removing unnecessary request. Removing a request automatically removes the dependencies in relevant dependents
// 		// Here download file dependency is removed from the onedrive create folder request
// 		batchRequestContent.removeRequest(fileDownloadId);

// 		// Now no requests depends on anything so the request will be made parallel in the service end
// 		// Extracting content from the instance
// 		let content = await batchRequestContent.getContent();

// 		//Making call to $batch end point with the extracted content
// 		let response = await client.api("/$batch").post(content);

// 		//Create instance with response from the batch request
// 		let batchResponse = new MicrosoftGraph.BatchResponseContent(response);

// 		//Getting iterator and looping through the responses iterator
// 		let iterator = batchResponse.getResponsesIterator();
// 		let data = iterator.next();
// 		while (!data.done) {
// 			console.log(data.value[0] + ":" + data.value[1]);
// 			data = iterator.next();
// 		}
// 	} catch (error) {
// 		console.error(error);
// 	}
// };

module.exports = outlookMailerController;