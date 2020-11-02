// const Campaign = require('./../../models').campaigns;
// const SubscriberList = require('./../../models').subscriber_lists;
// const CampaignSubscriberLists = require('./../../models').campaign_subscriber_lists;
// const SubscriberMail = require('./../../models').subscriber_mails;
// const StatusService = require('../../services/campaignService');
// const nodemailer = require('nodemailer');

// const sequelize = require('sequelize');

// const smtpTransport = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     auth: {
//         user: 'lokendra.k@cisinlabs.com',
//         pass: 'imd5GSdcfE'
//     }
// });


// module.exports.scheduled = async function (req, res, next) {

//     let err, data, data2, current_date, schdled_time;
//     let emailArr = [];

//     current_date=new Date();
    
//     [err, data] = await to(Campaign.findAll(
//         {
//             where: {
//                 status: StatusService.getstatus('READY'),
//                 is_scheduled: true,
//                 scheduled_time:
//                 {
//                     // $lte: sequelize.fn('now'),

//                     $lte: new Date()
//                     // $gte: new Date(new Date() - 24 * 360 * 3600 * 1000)
//                 }
//             },
//             include: [
//                 {
//                     model: SubscriberList,
//                     as: 'our_subscribers',
//                     attributes: ['id'],
//                     include: [
//                         {
//                             model: SubscriberMail,
//                             attributes: ['email']
//                         },

//                     ]
//                 },

//             ]
//         }
//     ));

//     // data.forEach(async function (element) {
//     //     element.our_subscribers.forEach(element => {
//     //         element.subscriber_mails.forEach(element => {
//     //             emailArr.push(element.email);
//     //         });
//     //     })


//     //     if (emailArr.length > 0) {

//     //         if (element.schdled_time == current_date || element.schdled_time < current_date) {
//     //             console.log("array=================", emailArr);

//     //             var mailOptions = {
//     //                 to: emailArr,
//     //                 cc: 'anukrati.s@cisinlabs.com,sharmaanukrati1994@gmail.com',
//     //                 headers: {
//     //                     'x-processed': 'a really long header or value with non-ascii characters 👮'
//     //                 },
//     //                 from: element.from_email,
//     //                 replyTo: element.reply_email,
//     //                 subject: element.subject_line,
//     //                 text: 'Hello preheader' + element.from_name,
//     //                 html: '<body><span class="preheader">Wishing you a safe!</span>  This is main message'
//     //             }
//     //             [err, data2] = await to(Campaign.update({ status: StatusService.getstatus('SENDING') }, {
//     //                 where: {
//     //                     id: element.id
//     //                 }
//     //             }));
//     //             console.log("mailer optiondfasdfsadf", mailOptions);
//     //             smtpTransport.sendMail(mailOptions, async function (err1, res) {

//     //                 if (err1) {
//     //                     console.log(err)
//     //                 } else {


//     //                 }
//     //                 [err, data2] = await to(Campaign.update({ status: StatusService.getstatus('COMPLETE') }, {
//     //                     where: {
//     //                         id: element.id
//     //                     }
//     //                 }));

//     //             });


//     //         }
//     //     }

//     // });

//     return ReS(res, {
//         data: data,
//         current_time: new Date,
//         message: "mail functionality"
//     }, 201);
// }