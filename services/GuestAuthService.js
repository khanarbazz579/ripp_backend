const User = require('./../models').share_guest_users,
    validator = require('validator'),
    bcrypt = require('bcrypt'),
    PasswordReset = require('./../models').password_resets,
    nodemailer = require('nodemailer');

const { smtpTransport } = require('./awsSesSmtpTransport');
const commonFunction = require('./commonFunction');
const rootFolderService = require('./rootFolderAwsService');

/**
 * Send success email after successfully registration
 * @param shareUser guest user object
 * @param originURL origin of url
 */
const _sendSharingLink = async (shareUser, originUrl) => {    
    var mailOptions = {
        to: shareUser.email,
        from: 'no-reply@ripplecrm.com',
        subject: "Successfully Registered at Ripple.",
        text: 'Welcome to Ripple Media.\n\n ' +
            'You have successfully registered your account.\n\n' +
            originUrl + '/shared-link/' + shareUser.url_token + '\n\n'
    };

    console.log("=================================================================== CHECKING GUEST  ===============", shareUser.email)
    
    smtpTransport.sendMail(mailOptions, function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res)
        }
    });
}

/**
 * Generate a random token with salt and email of guest user
 * @param email guest user email
 */
const _generateToken = async (email) => {
    let salt;

    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) TE(err.message, true);

    [err, hash] = await to(bcrypt.hash(email, salt));
    if (err) TE(err.message, true);

    hash = hash.replace(/\//g, '');

    return hash;
}

const GuestAuthService = (function () {

    //Get the unique key from request body
    const _getUniqueKeyFromBody = function (body) {
        let unique_key = body.unique_key;
        if (typeof unique_key === 'undefined') {
            if (typeof body.email != 'undefined') {
                unique_key = body.email
            } else if (typeof body.phone != 'undefined') {
                unique_key = body.phone
            } else {
                unique_key = null;
            }
        }

        return unique_key;
    };

    //Generate the hash password
    const _generateHashPassword = async function (password) {
      let salt, hash;

      [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message, true);

      [err, hash] = await to(bcrypt.hash(password, salt));
      if (err) TE(err.message, true);

      return hash;
    }

    /**
     * Create new guest user with user info
     * @param userInfo user information
     * @param originURL origin URL
     */
    this.createUser = async function (userInfo, originUrl) {

        let unique_key, auth_info, err, user;
        auth_info = {}

        if (!userInfo.first_name) 
            return TE('First name not entered.');
        if (!userInfo.last_name) 
            return TE('Last name not entered.');
        if (!userInfo.email) 
            return TE('Email not entered.');
        if (!userInfo.password) {
            return TE('Password not entered.');
        }else if (userInfo.password.length < 6) {
            return TE('Password should be upto 6 characters.');
        }

        unique_key = _getUniqueKeyFromBody(userInfo);

        if (!unique_key) 
            return TE('A valid email address was not entered.');

        if (validator.isEmail(unique_key)) {

            auth_info.method = 'email';
            userInfo.email = unique_key;
            
            userInfo.password = await _generateHashPassword(userInfo.password);
            
            let [err_token, email_verification_token] = await to( _generateToken(userInfo.email) );

            if(err_token){
                return ReE(res, err || 'Something went wrong!', 422);
            } 
            userInfo.email_verification_token = email_verification_token; 

            [err, user] = await to(User.findOne({
                where:{
                    email: userInfo.email
                }
            }));

            if(err){
                return TE(err.message);
            } 

            [err, user] = await to(user.update(userInfo,{
                where:{
                    email: userInfo.email
                }
            }));

            if(err){
                return TE(err);
            } else{
                
                let [err, data] = await to(commonFunction.mediaCommonFunction.getShareFileFolderDetail(user));

                if (err) {
                    return TE(err);
                    //return ReE(res, err || 'Something went wrong!', 422);
                }

                [err, data] = await to(commonFunction.mediaCommonFunction.resendRegistrationLink(user, data, originUrl));

                if (err) {
                    return TE(err);
                    //return ReE(res, err || 'Something went wrong!', 422);
                }
                 
                }
            console.log("-------------------------Before rootFolderService----------------------------");
            console.log("-------------user-----------------------",user);
            await rootFolderService.createRootFolderForUser(user.email,user.id,1);    
            return user;
        } else {
            return TE('A valid email address was not entered.');
        }
    }

    /**
     * Checks user is authenticated or not
     * @param userInfo user information
     */
    this.authUser = async function (userInfo) {

        let unique_key;
        let auth_info = {};
        auth_info.status = 'login';

        unique_key = _getUniqueKeyFromBody(userInfo);

        if (!userInfo.email) 
            return TE('Email not entered.');
        if (!userInfo.password) {
            return TE('Password not entered.');
        }else if (userInfo.password.length < 6) {
            return TE('Password should be upto 6 characters.');
        }

        let user;
        if (validator.isEmail(unique_key)) {
            auth_info.method = 'email';

            [err, user] = await to(User.findOne({ 
                where: { 
                    email: unique_key
                } 
            }));

            if (err) 
                TE(err.message);

        } else {
            TE('A valid email address was not entered.');
        }

        if (!user) TE('Not registered');
        
        [err, user] = await to(user.comparePassword(userInfo.password));
        
        if (err) TE(err.message);

        if(user.is_confirm){
            return user;
        }else if(!user.is_confirm){
            TE("Please confirm from the link sent to your email.");                
        }else{
            TE('Password not matched');
        }
    }

    /**
     * Send email to guest user email with confirmation link
     * @param userInfo guest usere mail
     * @param originURL origin URL
     */
    this.forgotPassword = async (user_email, originUrl) => {

        let user, password_reset, err;
    
        [err, user] = await to(
            User.findOne({
                where: { email: user_email }
            })
        );
    
        if(!user){
            return TE('No account with that email address exists.');
        } else {
    
            user_token = await user.getForgetPasswordToken(user_email);

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
                    to: user_email,
                    from: 'no-reply@ripplecrm.com',
                    subject: 'Welcome to Ripple. Please Validate your Email ',
                    text: 'Hello ' + user.first_name + ' \n\n' +
                    'Thank you for registering with Ripple CRM Media. Please validate your email by clicking here.'+'\n\n' +
                    originUrl + '/shared-link/forget-password/' + user_token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n\n\n' +
                    'Yours \n' +
                    'The Ripple team'
                };
                
                console.log("=================================================================== CHECKING GUEST  ===============", user_email)

                smtpTransport.sendMail(mailOptions, function(err,res) {
                    if(err){
                        console.log(err)
                    }else{
                        console.log(res)
                    }
                });
            }else{
                return TE('Error while generating token');
            }
        }
    
        return user
    }

    /**
     * Change password of guest user
     * @param requestBody guest usere info
     */
    this.changePassword = async function(requestBody){
        
        if(requestBody.old_password){

            let old_password = requestBody.old_password;

            let [err, user] = await to(
                User.findOne({
                    where: { 
                        email: requestBody.email
                    }
                })
            );

            if(err){
                return TE('Something went wrong.');    
            }

            [err, user] = await to(user.comparePassword(old_password));

            if(err){
                TE("Invalid Old Password.");
               }else{
                 
                let salt, hash;    
                [err, salt] = await to(bcrypt.genSalt(10));
                if (err) TE(err.message, true);

                [err, hash] = await to(bcrypt.hash(requestBody.new_password, salt));
                if (err) TE(err.message, true);
                
                [err, user] = await to(
                    user.update({
                        password: hash
                    })
                );
                
                return user;
            }   

        }else{
            return TE('Please enter old password.');
        }

    }

    /**
     * Reset password after uesr forgot and validate the confirmation link
     * @param requestBody guest usere info
     */
    this.resetPassword = async function(requestBody){

        let user, password_reset, err, user_email;

        let incoming_token = requestBody.fpcode;
        let new_password = requestBody.new_password;

        password_reset  = await (
            PasswordReset.findOne({
                where: { token: incoming_token }
            })
        );

        if(!password_reset){
            return TE('Password reset token is invalid.');
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
                    return TE('No user found with this email.');
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

                    console.log("=================================================================== CHECKING GUEST  ===============", user_email)

                    smtpTransport.sendMail(mailOptions, function(err,res) {
                        if(err){
                            console.log(err)
                        }else{
                            console.log(res)
                        }
                    });
                }

            }else{
                return TE('Password reset token expired.');
            }
        }

        return user;
    }

    return this;
})()

module.exports = GuestAuthService;