const User = require('./../models').users;
const Account = require('../models').accounts;
const Timezone = require('./../models').timezones;
const TwoFactorAuthentication = require('./../models').user_two_factor_authentications;
const validator = require('validator');
const moment = require('moment');

const getUniqueKeyFromBody = function (body) { // this is so they can send in 3 options unique_key, email, or phone and it will work
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
module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

const createUser = async function (userInfo) {
    let unique_key, auth_info, err;

    auth_info = {}
    auth_info.status = 'create';

    unique_key = getUniqueKeyFromBody(userInfo);
    if (!unique_key) TE('A valid email address was not entered.');

    if (validator.isEmail(unique_key)) {

        [err, user] = await to(User.findOne({
            where: {
                email: userInfo.email,
                is_deleted: '0'
            }
        }));
        if (user) TE('user already exists with that email');

        auth_info.method = 'email';
        userInfo.email = unique_key;

        [err, user] = await to(User.create(userInfo));
        return user;

    } else if (validator.isMobilePhone(unique_key, 'any')) { //checks if only phone number was sent
        auth_info.method = 'phone';
        userInfo.phone = unique_key;

        [err, user] = await to(User.create(userInfo));
        if (err) TE('user already exists with that phone number');

        return user;
    } else {
        TE(' A valid email address was not entered.');
    }
}
module.exports.createUser = createUser;

const authUser = async function (userInfo) { //returns token
    let unique_key;
    let auth_info = {};
    auth_info.status = 'login';
    unique_key = getUniqueKeyFromBody(userInfo);

    if (!unique_key) TE('Please enter an email or phone number to login');


    if (!userInfo.password) TE('Please enter a password to login');

    let user;
    if (validator.isEmail(unique_key)) {
        auth_info.method = 'email';

        [err, user] = await to(User.findOne({
            where: {
                email: unique_key,
                is_deleted: '0'
            },
            include: {
                model: Account,
                as: "account",
                include: {
                    model: Timezone,
                    as: "timezone"
                }
            }
        }));
        //  console.log(err, user, unique_key);
        if (err) TE(err.message);

    } else if (validator.isMobilePhone(unique_key, 'any')) { //checks if only phone number was sent
        auth_info.method = 'phone';

        [err, user] = await to(User.findOne({
            where: {
                phone: unique_key
            }
        }));
        if (err) TE(err.message);

    } else {
        TE(' A valid email address was not entered.');
    }

    if (!user) TE('Not registered');

    [err, user] = await to(user.comparePassword(userInfo.password));

    if (err) TE(err.message);

    return user;

}
module.exports.authUser = authUser;


/**
 * 
 * @param {Numner} user_id 
 * @param {String} ip 
 * @param {String} browser 
 * @description To check user last authentication from same browser and ip address.
 * @returns Array
 */
const checkUserAuthentication = async (user_id, ip, browser) => {
    let [err, data] = await to(
        TwoFactorAuthentication.findOne({
            where: {
                user_id: user_id,
                ip_address: ip,
                browser: browser,
                status: true,
                remember_device: true
                // created_at: {
                //     $gte: moment().subtract(30, 'days').toDate()
                // }
            }
        })
    );
    return [err, data]
}

/**
 * @param {String} OldPassword
 * @param {Number} userId
 * @description To check old password is valid or invalid
*/
const checkIsOldPasswordIsValid = async (oldPassword,userId) => {
	let [err,user] = await to(User.findOne({
            where: {
                id: userId
            }
        }));
    if (err) TE(err.message);
	[err, user] = await to(user.comparePassword(oldPassword));
    if (err) TE(err.message);
    return user;
}


/**
 * 
 * @param {*} data 
 */
const createTwoFactorAuthenticationRequest = async (data) => {
    let [err, result] = await to(
        TwoFactorAuthentication.create(data)
    );
    return [err, result]
}

const verifyAuthentication = async (data) => {
    let [err, verify] = await to(
        TwoFactorAuthentication.findOne({
            where: {
                user_id: data.user_id,
                auth_code: data.auth_code
            }
        })
    );
    if (err) TE(err.message);
    if (verify) {
        let [updateErr, updateData] = await to(TwoFactorAuthentication.update(
            {
                status: true,
                remember_device: data.device_access
            },
            {
                where: {
                    user_id: data.user_id,
                    auth_code: data.auth_code
                }
            }
        ));
        if (updateErr) TE(updateErr.message);

        let [uerr, user] = await to(User.findOne({
            where: {
                id: data.user_id,
                is_deleted: '0'
            },
            include: {
                model: Account,
                as: "account",
                include: {
                    model: Timezone,
                    as: "timezone"
                }
            }
        }));
        if (uerr) TE(uerr.message);
        return [null, user];
    } else {
        return ['Invalid Auth Code', null];
    }
}

module.exports.checkUserAuthentication = checkUserAuthentication;
module.exports.createTwoFactorAuthenticationRequest = createTwoFactorAuthenticationRequest;
module.exports.verifyAuthentication = verifyAuthentication;
module.exports.checkIsOldPasswordIsValid = checkIsOldPasswordIsValid;