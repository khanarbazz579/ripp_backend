process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const moment = require('moment')
const { google } = require('googleapis');
const MailerToken = require('../models').mailer_tokens;
const TOKEN_PATH = __dirname + '/../config/googletoken.json';
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const EmailUser = require('./../models').email_users;
const EmailProvider = require('./../models').email_providers;
let googleAppAuth = function () {
    const fileContent = fs.readFileSync(TOKEN_PATH);
    this.googleTokenData = JSON.parse(fileContent);
}

googleAppAuth.prototype.getAccessUrl = async function (user_id) {
    const { client_secret, client_id, redirect_uris } = this.googleTokenData.installed;
    var oAuth2Client = await new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const authUrl = await oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: JSON.stringify({ user_id: user_id }),
    });
    return authUrl;
}

googleAppAuth.prototype.authorize = async function (code, callback) {

    try {
        const { client_secret, client_id, redirect_uris } = this.googleTokenData.installed;

        var oAuth2Client = await new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        var token = await oAuth2Client.getToken(code);

        oAuth2Client.setCredentials(token.tokens);
        var gmail = google.gmail({
            auth: oAuth2Client,
            version: 'v1'
        });
        var _that = this;
        gmail.users.getProfile({
            'userId': 'me'
        }, function (err, user) {

            if (err) return callback(err);
            const userEmail = user.data.emailAddress;

            _that.saveVauesToDb(userEmail, token.tokens, (saveStatus) => {

                if (saveStatus) {
                    callback(false, token.tokens);
                } else {
                    callback(false, false);
                }
            });
        });
    } catch (err) {
        callback(err);
    }
};

googleAppAuth.prototype.saveVauesToDb = async function (user, token, callback) {
    // if (!user) {
    //     return "user is required";
    // }
    // if (!token) {
    //     return "token is required";
    // }
    // if (typeof callback !== "function") {
    //     return "Callback should be function";
    // }
    let emailError, emailUser;
    [emailError, emailUser] = await to(
        MailerToken.findOne({
            where: { status: "Pending" },
            order: [
                ['id', 'DESC']
            ],
            limit: 1
        })
    );

    if (emailUser) {
        emailUser = emailUser.toJSON();
        let err, userUpdate;
        [err, userUpdate] = await to(MailerToken.update({
            mailer_token: token.access_token,
            mailer_refresh_token: token.refresh_token,
            status: "Done",
            email_user: user
        }, {
            where: { id: emailUser.id }
        }));

        let [errp, emailProviders] = await to(EmailProvider.findOne({
            where: { email_provider_name: 'Gmail' }
        }));
        if (emailProviders) {
            emailProviders = emailProviders.toJSON();
        }

        await to(
            EmailUser.create({
                email_provider_id: emailProviders.id,
                user_id: emailUser.user_id,
                email_user_name: user

            })
        );

        if (!err) {
            callback(true);
        } else {
            callback(false);
        }
    } else {

        callback(false);
    }
};

googleAppAuth.prototype.getAccessToken = async function (email_user) {
    if (!email_user) {
        return "email_user is required";
    }
    let emailError, emailUser;
    [emailError, emailUser] = await to(
        MailerToken.findAll({
            attributes: ['mailer_token', 'mailer_refresh_token', MailerToken.sequelize.literal(`(SELECT  DATE_ADD(NOW(), INTERVAL -4 HOUR))`)],
            where: { email_user: email_user, status: "Done", updated_at: { $gte: MailerToken.sequelize.literal(`(SELECT  DATE_ADD(NOW(), INTERVAL -4 HOUR))`) } }
        }).map(el => el.get({ plain: true }))
    );
    if (!emailError && emailUser.length > 0) {
        try {
            const { client_secret, client_id, redirect_uris } = this.googleTokenData.installed;
            var oAuth2Client = await new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            var token = {
                access_token: emailUser[0].mailer_token,
                refresh_token: emailUser[0].mailer_refresh_token
            }
            oAuth2Client.setCredentials(token);
            this.updateCurrentToken(email_user, emailUser[0].mailer_token, emailUser[0].mailer_refresh_token);
            var gmail = google.gmail({
                auth: oAuth2Client,
                version: 'v1'
            });
            return gmail;
        } catch (err) {
            return err;
        }

    } else {
        return false;
    }
};

googleAppAuth.prototype.updateCurrentToken = async function (user, access_token, refresh_token) {
    if (!user) {
        return "user is required"
    }
    let err, userUpdate;
    [err, userUpdate] = await to(MailerToken.update({
        mailer_token: access_token,
        mailer_refresh_token: refresh_token,
        status: "Done"
    }, {
        where: { email_user: user }
    }));
    return true;
}

googleAppAuth.prototype.clearToken = async function (emailUserName) {
    if (!emailUserName) {
        return "emailUserName is required";
    }
    let err, email_user;
    [err, email_users] = await to(
        MailerToken.destroy({
            where: { email_user: emailUserName }
        })
    );
    if (err) {
        return false;
    } else {
        return true;
    }
}

googleAppAuth.prototype.checkTokenExist = async function (emailUserName) {
    if (!emailUserName) {
        return "emailUserName is required";
    }
    let err, email_user;
    [err, email_user] = await to(
        MailerToken.findAll({
            where: {
                updated_at: {
                    $gte: moment().subtract(1, 'hours').toDate()
                },
                email_user: emailUserName
            }
        })
    );
    if (err) {
        return false;
    }
    if (email_user && email_user.length > 0) {
        if (email_user[0].status == "Pending") {
            this.clearToken(emailUserName);
            return false;
        }
        return true;
    } else {
        return false;
    }
}

googleAppAuth.prototype.createTokenRequest = async function (userName, ip, user_id) {
    let mailerTokenId = 3; // 3 = Google mailer token with username, //4 = Google mailer toeken by ip address
    if (!userName) {
        //return "userName is required";
        userName = ip;
        mailerTokenId = 4;
    }
    let isNoErr = true;
    const userTokenObj = {
        mailer_token_id: mailerTokenId,
        email_user: userName,
        status: "Pending",
        mailer_token: "",
        mailer_refresh_token: "",
        user_id: user_id
    }
    let err, status;
    [err, status] = await to(
        MailerToken.create(userTokenObj)
    );

    if (err) {
        isNoErr = false;
    }
    return isNoErr;
};

googleAppAuth.prototype.refresh = async function () {
    let emailError, emailUser;
    [emailError, emailUser] = await to(
        MailerToken.findAll({
            attributes: ['email_user'],
            where: {
                provider: "google"
            }
        })
    )

    emailUser = emailUser || [];
    for (let i = 0; i < emailUser.length; i++) {
        await this.getAccessToken(emailUser[i].email_user);
    }
    return true;
}

module.exports = googleAppAuth;