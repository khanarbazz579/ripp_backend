const User          = require('../../models').users;
const PasswordReset = require('../../models').password_resets;
const bcrypt        = require('bcrypt');

const { smtpTransport } = require('../../services/awsSesSmtpTransport');

const resetPassword = async function(req, res){
    let user, password_reset, err, user_email;

    let incoming_token = req.body.fpcode;
    let new_password = req.body.new_password;

    password_reset  = await (
        PasswordReset.findOne({
            where: { token: incoming_token }
        })
    );

    if(!password_reset){
        return ReE(res, 'Password reset token is invalid.');
    }else{

        user_email = password_reset.email;
        let expiredAt = password_reset.expired_at;
        let current_date = new Date().getTime();

        if( expiredAt > current_date ){

            let salt, hash;
            [err, salt] = await to(bcrypt.genSalt(10));
            if(err) TE(err.message, true);

            [err, hash] = await to(bcrypt.hash(new_password, salt));
            if(err) TE(err.message, true);

            new_password = hash;


            [err, user] = await to(
                User.update( { password : new_password  } , {
                    where: { email: password_reset.email }
                })
            );

            if(!user){
                return ReE(res, 'No user found with this email.');
            }else{
                [err, password_reset] = await to(
                    PasswordReset.destroy({
                        where: { email: password_reset.email }
                    })
                );

                let mailOptions = {
                    to: user_email,
                    from: 'no-reply@ripplecrm.com',
                    subject: 'Ripple Admin - Password Changed',
                    text: 'Hello ' + user_email + ' \n\n' +
                    'Your password has been changed successfully. \n' +
                    'Please try to login with your new password. \n\n' +
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
            }

        }else{
            return ReE(res, 'Password reset token expired.');
        }
    }

    return ReS(res, {user: user } );
}
module.exports.resetPassword = resetPassword;