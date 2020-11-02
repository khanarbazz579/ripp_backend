const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;
const smtpTransport = nodemailer.createTransport({
    host: "mail.smtp2go.com",
    auth: {
        user: CONFIG.sender_name,
        pass: CONFIG.sender_pass
    }
});
const Campaign = require('../../models').campaigns;
const StatusService = require('../../services/campaignService');
const EmailListSubscribersService = require('../../services/emailListSubscribers');

const readyCron = async function () {

    let err, data, data2, listHeaders, emailArr = [], tempArr = [], campaigns, emailTemplate;
    [err, data] = await to(Campaign.findAll(
        {
            where: {
                status: StatusService.getstatus('READY'),
                is_scheduled: false
            }
        }
    ));

    if (data) {
        data.forEach(async function (element) {
            if (element.dataValues) {
                listHeaders = JSON.parse(element.dataValues.list_headers)
            }

            // called the service to get the list subscribers emails from their list id
            emailArr = await EmailListSubscribersService.getListSubscribers(listHeaders);

            if (emailArr.length > 0) {
                [err, data2] = await to(Campaign.update({ status: StatusService.getstatus('SENDING') }, {
                    where: {
                        id: element.id
                    }
                }));
                let sendEmail = [];
                let percentage;
                for (var i = 0, len = emailArr.length; i < len; i++) {
                    // called the service to build email template to track the clicks
                    emailTemplate = await EmailListSubscribersService.buildEmailTemplate(element, emailArr[i], listHeaders);
                    if (emailArr[i] && emailArr[i].email) {
                        var mailOptions = {
                            to: emailArr[i].email,
                            headers: listHeaders,
                            // cc: 'anukrati.s@cisinlabs.com , sharmaanukrati1994@gmail.com',
                            from: "" + element.from_name + " <" + element.from_email + ">",
                            replyTo: element.reply_email,
                            subject: element.subject_line,
                            html: '<header style="display: none;" class="preheader">' + element.preheader_text + '</header><style>.preheader{ display: none; }</style><body>' + emailTemplate + '</body>'
                        }
                        smtpTransport.sendMail(mailOptions, async function (error, res) {
                            if (error) {
                                console.log("err in smtpTransport sendmail-->", err)
                            } else {
                                console.log("success in smtpTransport sendmail-->", res)
                            }
                            sendEmail.push(mailOptions.email);
                            percentage = ((sendEmail.length / emailArr.length) * 100).toFixed(2);
                            [err, data2] = await to(Campaign.update({ email_percentage: percentage, status: 3 }, {
                                where: {
                                    id: element.id
                                }
                            }));
                        });
                    }
                }
            }

        });
    }
}

const scheduled = async function () {

    let err, data, data2, emailArr = [], tempArr = [], listHeaders;
    [err, data] = await to(Campaign.findAll(
        {
            where: {
                status: StatusService.getstatus('READY'),
                is_scheduled: true,
                scheduled_time:
                {
                    $lte: new Date()

                }
            }
        }
    ));

    if (data) {
        data.forEach(async function (element) {
            if (element.dataValues) {
                listHeaders = JSON.parse(element.dataValues.list_headers)
            }

            // called the service to get the list subscribers emails from their list id
            emailArr = await EmailListSubscribersService.getListSubscribers(listHeaders);

            if (emailArr.length > 0) {
                [err, data2] = await to(Campaign.update({ status: StatusService.getstatus('SENDING') }, {
                    where: {
                        id: element.id
                    }
                }));

                let sendEmail = [];
                let percentage;
                for (var i = 0, len = emailArr.length; i < len; i++) {
                    // called the service to build email template to track the clicks
                    emailTemplate = await EmailListSubscribersService.buildEmailTemplate(element, emailArr[i], listHeaders);
                    if (emailArr[i] && emailArr[i].email) {
                        var mailOptions = {
                            to: emailArr[i].email,
                            headers: listHeaders,
                            // cc: 'anukrati.s@cisinlabs.com , sharmaanukrati1994@gmail.com',
                            from: "" + element.from_name + " <" + element.from_email + ">",
                            replyTo: element.reply_email,
                            subject: element.subject_line,
                            html: '<header style="display: none;" class="preheader">' + element.preheader_text + '</header><style>.preheader{ display: none; }</style><body>' + emailTemplate + '</body>'
                        };

                        smtpTransport.sendMail(mailOptions, async function (error, res) {
                            if (error) {
                                console.log("error--smtpTransport--sendMail--", err)
                            } else {

                            }
                            sendEmail.push(mailOptions.email);
                            percentage = ((sendEmail.length / emailArr.length) * 100).toFixed(2);
                            [err, data2] = await to(Campaign.update({ email_percentage: percentage, status: 3 }, {
                                where: {
                                    id: element.id
                                }
                            }));
                        });

                    }
                }

            }
        });
    }
}

const job = new CronJob('*/60 * * * * *', function () {
    readyCron();
    scheduled();
});

// job.start();

module.exports.ready = readyCron
module.exports.scheduled = scheduled
