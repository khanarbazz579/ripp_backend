const User          = require('../../models').users;
const PasswordReset = require('../../models').password_resets;
const bcrypt        = require('bcrypt');

const { smtpTransport } = require('../../services/awsSesSmtpTransport');

const forgot = async function(req, res){
    let user, password_reset, err;

    user_email = req.body.reminder_email;

    [err, user] = await to(
        User.findOne({
            where: { email: user_email }
        })
    );

    if(!user){
        return ReE(res, 'No account with that email address exists.',422);
    } else {

        user_token = user.getForgetPasswordToken();
        [err, delReset] = await to(
            PasswordReset.destroy({
                where: {
                    email: user.email
                }
            })
            );

        password_reset = await(
            PasswordReset.create({
                email: user.email,
                token: user_token,
                generated : `${new Date().getTime()}`,
                expired_at : `${new Date(new Date().setHours(new Date().getHours() + 1)).getTime()}`
            })
        );
        if(password_reset){
            var mailOptions = {
                to: req.body.reminder_email,
                from: 'no-reply@ripplecrm.com',
                subject: 'Ripple Admin - Password Reset Request',
                text: 'Hello ' + user.first_name + ' \n\n' +
                'You have requested a new password for Ripple account with ' + req.body.reminder_email + '.\n\n' +
                'No changes have been made to your account yet. \n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                req.headers.origin + '/forget-password/' + user_token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n\n\n' +
                'Yours \n' +
                'The Ripple team'
            };
            smtpTransport.sendMail(mailOptions, function(err,res) {
                if(err){
                    console.log(err)
                }else{
                    console.log(res)
                }
            });
        }else{
            return ReE(res, 'Error while generating token');
        }

    }

    return ReS(res,{user: user },201);
}
module.exports.forgot = forgot;
