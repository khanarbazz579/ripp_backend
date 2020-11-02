const jwt = require('jsonwebtoken');
const Models = require('../../models');
const Subscribers = Models.subscribers;
const Contacts = Models.contacts;
const SmtpStatistics = Models.smtp_statistics;
const ClickedLinks = Models.clicked_links;
// const nodemailer = require("nodemailer");

module.exports = (function () {


    // let sendMail = async (data) => {
    //     let transporter = nodemailer.createTransport({
    //         host: "mail.smtp2go.com",
    //         port: 2525,
    //         secure: false,
    //         auth: { user: 'mohammad.z@cisinlabs.com', pass: 'GT9JXhVeryiV' }
    //     });

    //     let random = [];
    //     let z = 0;
    //     for (let i = 0; i < 50; i++) {
    //         random.push(Math.random());
    //         z++;
    //     }

    //     // send mail with defined transport object
    //     let info = await transporter.sendMail({
    //         headers: {
    //             'x-list-id': random
    //         },
    //         from: 'Mohd Zeeshan <testing@mailinator.com>',
    //         to: "Test Name 1<mohammad.z@cisinlabs.com>",
    //         subject: "Custom header with webhook test ID - " + Math.random(),
    //         text: "Hello world? ----",
    //         html: "<b>Mail with header: header data is </b><br><p>" + JSON.stringify(data) + "</p>"
    //     });
    //     console.log("TCL: main -> random--", JSON.stringify(random), '------occurences-----', z);

    //     console.log("Message sent: %s", JSON.stringify(info));

    //     console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    //     console.timeEnd('Email sending method called');
    // }

    let setStatus = async (email, event, x_list_ids, body, user_agent) => {
        // console.log("TCL: setStatus -> body", body)
        let queryObj = {
            include: [
                {
                    model: Contacts,
                    as: 'subscriber',
                    where: {
                        email
                    }
                }
            ]
        },
            isUpdated = false;

        if (x_list_ids && x_list_ids.length && x_list_ids.length > 0)
            queryObj.where = {
                list_id: x_list_ids
            }

        const [err, data] = await to(Subscribers.findAll(queryObj));

        if (!err && data && data.length) {
            data.forEach(subscriber => {
                let createSmtpStatisticsObj = {
                    subscriber_id: subscriber.dataValues.id,
                    list_id: subscriber.dataValues.list_id,
                    event,
                    user_agent: (user_agent ? user_agent : ''),
                    time_stamp: (body && body.time) ? new Date(body.time) : new Date(),
                    response: JSON.stringify(body)
                },
                    subscriberUpdateObj = {
                        status: event
                    }
                if (event === 'hard_bounce') {
                    subscriberUpdateObj.last_hardbounce_at = (body && body.time) ? new Date(body.time) : new Date();
                    subscriberUpdateObj.hardbounce_count = (typeof subscriber.hardbounce_count === 'number') ? (subscriber.hardbounce_count + 1) : 1;
                }

                SmtpStatistics.create(createSmtpStatisticsObj);
                subscriber.update(subscriberUpdateObj)
            });
            isUpdated = true;
        }

        return { err, data, isUpdated }
    }

    let handleBounce = async (email, bounce, x_list_ids, body) => {
        return await setStatus(email, (bounce === 'hard') ? 'hard_bounce' : 'soft_bounce', x_list_ids, body);
    }

    let handleSpam = async (email, x_list_ids, body) => {
        return await setStatus(email, 'reported_spam', x_list_ids, body);
    }

    let handleUnSubscribe = async (email, x_list_ids, body) => {
        return await setStatus(email, 'un_subscribed', x_list_ids, body);
    }

    let handleReject = async (email, x_list_ids, body) => {
        return await setStatus(email, 'hard_bounce', x_list_ids, body);
    }

    let handleOpen = async (email, user_agent, x_list_ids, body) => {
        return await setStatus(email, 'opened', x_list_ids, body, user_agent);
    }

    this.handleWebHookRequests = async (req, res, next) => {
        const {
            event,   /* it identifies the type of event occur i.e. bounce, spam, unsubscribe, reject, etc */
            rcpt,    /* it's the email address for which event occur for */
            bounce,  /* Optional: specifies type of bounce in case, event is bounce */
        } = req.body;

        const user_agent = req.body['user-agent']; /* Optional: it should be navigator information in case event is open */
        let x_list_ids = req.body['X-List-ID']; /* It should be the List id we set in the header at the time of sending campaign */
        let err, result;
        // let sent = await sendMail(req.body);

        switch (event) {
            case 'bounce':
                result = await handleBounce(rcpt, bounce, x_list_ids, req.body);
                break;
            case 'spam':
                result = await handleSpam(rcpt, x_list_ids, req.body);
                break;
            case 'unsubscribe':
                result = await handleUnSubscribe(rcpt, x_list_ids, req.body)
                break;
            case 'reject':
                result = await handleReject(rcpt, x_list_ids, req.body);
                break;
            case 'open':
                result = await handleOpen(rcpt, user_agent, x_list_ids, req.body);
                break;
            default:
                result = { data: [], isUpdated: false }
                break;
        }

        if (result && result.err) return ReE(res, err, 422)
        return ReS(res, {
            data: result.data,
            isUpdated: result.isUpdated,
            requestBody: req.body,
            // sent
        }, 200);
    }

    this.handleClickedLinksRecords = async (req, res, next) => {

        try {
            let token = req.body.token, statistics, decodedToken, clickedLinkExists;
            if (!req.body.token) {
                return TE('Invalid parameters!');
            }

            decodedToken = await jwt.verify(token, CONFIG.jwt.encryption);

            if (!decodedToken) {
                return TE('Token not matched');
            }

            clickedLinkExists = await ClickedLinks.findOne({
                where: {
                    subscriber_id: decodedToken.subscriber_id,
                    template_link_id: decodedToken.template_link_id
                }
            });

            if (!clickedLinkExists) {
                let createClickedLinksObj = {
                    subscriber_id: decodedToken.subscriber_id,
                    template_link_id: decodedToken.template_link_id,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                statistics = await ClickedLinks.create(createClickedLinksObj);
                return ReS(res, { message: 'Clicked linked save in the database' }, 200);
            }

            return ReS(res, { message: 'Clicked linked record already exists in the database' }, 200);
        } catch (err) {
            return ReE(res, err, 422);
        }
    }

    return this;

})();
