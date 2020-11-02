'use strict';
const nodemailer = require('nodemailer');
const CONFIG = require('../config/config')

const smtpTransport = nodemailer.createTransport(CONFIG.aws_ses_smtp);

// verify connection configuration
// smtpTransport.verify(function(error, success) {
//     if (error) {
//       console.log("error=====10",error);
//     } else {
//       console.log("Server is ready to take our messages");
//     }
// });

module.exports = { smtpTransport };



