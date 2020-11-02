const MailerToken = require('./../models').mailer_tokens;
const inspect = require('util').inspect;
const moment = require('moment')
const EmailUser = require('./../models').email_users;
const EmailProvider = require('./../models').email_providers;
function Auth(credentials, authForData) {
    if (!credentials) {
        this.terror = "credentials is required";
        return false;
    }
    if (!authForData) {
        this.terror = "authForData is required";
        return false;
    }
    this.credentials = credentials;
    this.authForData = authForData;
    this.oauth2 = require('simple-oauth2').create(this.credentials);
    this.jwt = require('jsonwebtoken');
}

Auth.prototype.getAuthUrl = function () {
    const returnVal = this.oauth2.authorizationCode.authorizeURL({
        redirect_uri: this.authForData[0],
        scope: this.authForData[1]
    });
    return returnVal;
}

Auth.prototype.getTokenFromCode = async function (auth_code, res, ip = null) {
    if (!auth_code) {
        return this.terror = "auth code is required";
    }
    try {
        let result = await this.oauth2.authorizationCode.getToken({
            code: auth_code,
            redirect_uri: this.authForData[0],
            scope: this.authForData[1]
        });
        const token = this.oauth2.accessToken.create(result);
        let tokenVerify = await this.saveVauesToDb(token, false, ip);
        if (tokenVerify) {
            return token.token.access_token;
        } else {
            return false;
        }
    } catch (err) {
        return err;
    }
};

Auth.prototype.getAccessToken = async function (email_user) {
    if (!email_user) {
        return "User name required";
    }
    let emailError, emailUser;
    [emailError, emailUser] = await to(
        MailerToken.findAll({
            attributes: ['mailer_token', MailerToken.sequelize.literal(`(SELECT  DATE_ADD(NOW(), INTERVAL -1 HOUR))`)],
            where: { email_user: email_user, status: "Done", updated_at: { $gte: MailerToken.sequelize.literal(`(SELECT  DATE_ADD(NOW(), INTERVAL -1 HOUR))`) } }
        }).map(el => el.get({ plain: true }))
    );
    if (!emailError && emailUser.length > 0) {
        return emailUser[0].mailer_token;
    } else {
        let refreshErr, refreshTokenUser;
        [refreshErr, refreshTokenUser] = await to(
            MailerToken.findAll({
                attributes: ['mailer_refresh_token'],
                where: { email_user: email_user, status: "Done", updated_at: { $gte: MailerToken.sequelize.literal(`(SELECT  DATE_ADD(NOW(), INTERVAL -2 HOUR))`) } }
            }).map(el => el.get({ plain: true }))
        );
        if (!refreshErr && refreshTokenUser.length > 0) {
            const newToken = await this.oauth2.accessToken.create({ refresh_token: refreshTokenUser[0].mailer_refresh_token }).refresh();

            if (newToken.expired()) {
                try {
                    accessToken = await accessToken.refresh();
                } catch (error) {

                }
            }
            this.saveVauesToDb(newToken, true);
            return newToken.token.access_token;
        } else {
            return false;
        }
    }
};

Auth.prototype.saveVauesToDb = async function (token, res, ip) {
    if (!token) {
        return "token is required";
    }
    if (res && typeof res != 'boolean') {
        return "invalid value for res";
    }
    let user = this.jwt.decode(token.token.id_token);
    if (!user) {
        user = {};
    }
    let emailError, emailUser;
    [emailError, emailUser] = await to(
        MailerToken.findOne({
            attributes: ['email_user'],
            where: { email_user: user.preferred_username, status: "Pending" }
        })
    )

    let mailUser = user.preferred_username;
    if (!emailUser) {
        [emailError, emailUser] = await to(MailerToken.findOne({
            where: { email_user: ip, status: "Pending", mailer_token_id: 2 }
        }));
        mailUser = ip;
    }
    if (emailUser) {
        emailUser = emailUser.toJSON();

        

        let err, userUpdate;
        [err, userUpdate] = await to(MailerToken.update({
            mailer_token: token.token.access_token,
            mailer_refresh_token: token.token.refresh_token,
            status: "Done",
            email_user: user.preferred_username,
        }, {
            where: { email_user: mailUser }
        }));

        let [errp, emailProviders] = await to(EmailProvider.findOne({
            where: { email_provider_name: 'Outlook' }
        }));
        if (emailProviders) {
            emailProviders = emailProviders.toJSON();
        }
      await to(
        EmailUser.create({
            email_provider_id: emailProviders.id,
            user_id:  emailUser.user_id,
            email_user_name:  user.preferred_username

        })
      );
        if (!err) {
            return true;
        }

    } else {
        return false;
    }
};


Auth.prototype.checkTokenExist = async function (emailUserName) {
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


Auth.prototype.clearToken = async function (emailUserName) {
    if (!emailUserName) {
        return "emailUserName is required";
    }
    let err, email_user;
    [err, email_users] = await to(
        MailerToken.destroy({
            where: { email_user: emailUserName }
        })
    );
    if (!err) {
        return true;
    }
}



Auth.prototype.createTokenRequest = async function (userName, ip,user_id) {
    let mailerTokenId = 1; // 1 = Outlook mailer token with username, //2 = Outlook mailer toeken by ip address
    if (!userName) {
        //return "userName is required";
        userName = ip;
        mailerTokenId = 2;
    }
    const userTokenObj = {
        email_user: userName,
        status: "Pending",
        mailer_token: "",
        mailer_refresh_token: "",
        mailer_token_id: mailerTokenId,
        user_id: user_id
    }
    let err, status;
    [err, status] = await to(
        MailerToken.create(userTokenObj)
    );


    if (!err) {
        return true;
    }
};


Auth.prototype.refresh = async function () {
    let emailError, emailUser;
    [emailError, emailUser] = await to(
        MailerToken.findAll({
            attributes: ['email_user'],
            where: {
                provider: "outlook"
            }
        })
    )
    if (!emailUser) emailUser = [];
    for (let i = 0; i < emailUser.length; i++) {
        await this.getAccessToken(emailUser[i].email_user);
    }
    return true;
}

module.exports = Auth;