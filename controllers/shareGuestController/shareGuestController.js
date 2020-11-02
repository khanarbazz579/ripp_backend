const models = require('../../models');
const ShareGuestUser = models.share_guest_users;
const ShareFilesFolder = models.share_files_folders;

const commonFunction = require('../../services/commonFunction');

let defaultAttributes = ['id', 'first_name', 'last_name', 'email', 'status'];

/**
 * Verify recovery link send to user 
 * @param req request object
 * @param res response object
 */
const verifyRecoveryLink = async (req, res) => {
    let { query } = req;

    let [err, user] = await to(Share_Guest_Users.findAll({
        attributes: ['id'],
        where: {
            email_verification_token: query.token
        }
    }))

    if (err || !user.length) {
        return ReE(res, err || 'Either token is expired or is invalid!', 500);
    }

    return ReS(res, {
        message: 'Token is valid', payload: {
            user: user[0]
        }
    });
}

/**
 * Resend email to guest user after they request 
 * new email confirmation link
 * @param req request object
 * @param res response object
 */
const resendEmail = async (req, res) => {

    let [err, data] = await to(commonFunction.mediaCommonFunction.getShareFileFolderDetail(req.body));

    
    if (err) {
        return ReE(res, err || 'Something went wrong!', 422);
    }

    [err, data] = await to(commonFunction.mediaCommonFunction.resendRegistrationLink(req.body, data, req.headers.origin));

    if (err) {
        return ReE(res, err || 'Something went wrong!', 422);
    }

    return ReS(res, {
        message: 'Email Sent Successfully',
    });
}

/**
 * Verify the share url token for secure login and registration
 * @param req request object
 * @param res response object
 */
const verifySharingToken = async (req, res) => {

    let { query } = req;
    let tokenFilter; 

    if( query.type == "url" ){
        tokenFilter = {
            url_token: query.token
        }
    }else if( query.type == "register" ){
        tokenFilter = {
            email_verification_token: query.token
        }
    }else {
        return ReE(res, 'Invalid token type.', 422);
    } 

    let [err, user] = await to(ShareGuestUser.findAll({
        where: tokenFilter
    }))

    if (err || !user.length) {
        return ReE(res, err || 'Either token is expired or is invalid.', 422);
    }

    return ReS(res, {
        message: 'Token is valid',
        user: user[0]
    });
}

/**
 * Update the guest user body
 * @param req request object
 * @param res response object
 */
const update = async (req, res) => {
    let err, share_user;

    if (isNaN(parseInt(req.params.id))) {
        return ReE(res, { success: false, message: 'It should have requested user id.' }, 401);
    }

    [err, share_user] = await to(
        ShareGuestUser.findByPk(req.params.id)
    );

    if(!share_user.status && req.body.status){
        let [err, data] = await to(commonFunction.mediaCommonFunction.getShareFileFolderDetail(share_user));
        if (err) {
            return ReE(res, err || 'Something went wrong!', 422);
        }
        [err, data] = await to(commonFunction.mediaCommonFunction.successRegistrationLink(share_user, data, req.headers.origin));

        if (err) {
            return ReE(res, err || 'Something went wrong!', 422);
        }
    }

    if (err) {
        return ReE(res, err, 422);
    }
    
    if(share_user){ 
        [err, share_user] = await to(
            share_user.update(req.body)
        );

        if (err) {
            return ReE(res, err, 422);
        }
        return ReS(res, { user: share_user, message: 'Share user updated successfully.' });
    }else{
        return ReE(res, { success: false, message: 'No record found'}, 401);
    }
}

module.exports.update = update; 
module.exports.verifySharingToken = verifySharingToken;
module.exports.resendEmail = resendEmail;
module.exports.verifyRecoveryLink = verifyRecoveryLink;