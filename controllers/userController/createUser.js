const authService = require('./../../services/AuthService');
const rootFolderService = require('./../../services/rootFolderAwsService');
const PasswordReset = require('../../models').password_resets;
const bcrypt = require('bcrypt');

const { smtpTransport } = require('../../services/awsSesSmtpTransport');

const create = async function(req, res) {

    const body = req.body;
    if (!body.email) {
        return ReE(res, 'Please enter an email to register.');
    }
    if (!body.first_name) {
        return ReE(res, 'Please enter a firstname to register.');
    }
    if (!body.last_name) {
        return ReE(res, 'Please enter a lastname to register.');
    }
    let err, user;

    [err, user] = await to(authService.createUser(body));

    if (err) return ReE(res, err, 422);

    if (user) {
        // create a root AWS folder for user
        await rootFolderService.createRootFolderForUser(user.email, user.id);
    }
    if (!body.password) {
        user_token = user.getForgetPasswordToken();

        [err, password_reset] = await to(
            PasswordReset.create({
                email: user.email,
                token: user_token,
                generated: `${new Date().getTime()}`,
                expired_at: `${new Date(new Date().setHours(new Date().getHours() + 24)).getTime()}`
            })
        );
        if (err) return ReE(res, "Error while generating token", 422);

        if (password_reset) {
            var mailOptions = {
                to: user.email,
                from: 'no-reply@ripplecrm.com',
                subject: 'Ripple Admin - Password Request',
                text: 'Hello ' + user.first_name + ' \n\n' +
                    ' You have been added to the CRM with ' + user.email + '.\n\n' +
                    ' Follow this link to setup your account, or paste this into your browser to complete the process:\n\n' +
                    req.headers.origin + '/create-password/' + user.first_name + '/' + user_token + '\n\n' +
                    'The Ripple team'
            };

            console.log("=================================================================== CHECKING CREATE USER  ===============", user.email)
            smtpTransport.sendMail(mailOptions, async(err, resp) => {

                if (err) {
                    // return ReE(res,"Error while sending Email",422);
                    return ReE(res, "Error while sending mail", 422);
                } else {
                    return ReS(res, { message: 'Successfully created new user.', user: user.toWeb(), token: user.getJWT() }, 201);
                }
            });
        };

    } else {
        return ReS(res, { message: 'Successfully created new user.', user: user.toWeb(), token: user.getJWT() }, 201);
    }


};

module.exports.create = create;