const { createUser, authUser, forgotPassword, resetPassword } = require('../../services/GuestAuthService');

/**
 * Call guest auth service method to 
 * register the guest user
 * @param req request object
 * @param res response object
 */
const register = async (req, res) => {
    const { body } = req;
    let [err, user] = await to(createUser(body,req.headers.origin));
    if (err) return ReE(res, err, 422);

    return ReS(res, {
        message: 'Registered successfully!',
        user: user
    });
}

/**
 * Authenticate guest user through service method  
 * @param req request object
 * @param res response object
 */
const authenticate = async (req, res) => {

    const { body } = req;
    let [err, user] = await to(authUser(body));
    if (err) return ReE(res, err, 422);
    return ReS(res, { token: user.getJWT(), user: user });
}

/**
 * Send a link to guest user who forgot the password  
 * @param req request object
 * @param res response object
 */
const forgetPassword = async (req, res) => {
    const { body } = req;
    let [err, user] = await to(forgotPassword(body.reminder_email, req.headers.origin));

    if (err) return ReE(res, err, 422);

    return ReS(res, {
        message: 'Reset link sent to your email!',
        user: user
    });
}

/**
 * Reset the password after forgotten
 * @param req request object
 * @param res response object
 */
const resetPasswordAfterForgot = async (req, res, next) => {
    const { body } = req;
    let [err, user] = await to(resetPassword(req.body));

    if (err) return ReE(res, err, 422);

    return ReS(res, {user: user } );
}

/**
 * Update the password of guest user
 * @param req request object
 * @param res response object
 */
const updatePassword = async (req, res, next) => {
    const { body } = req;
    let [err, user] = await to(changePassword(req.body));

    if (err) return ReE(res, err, 422);

    return ReS(res, {user: user } );
}

module.exports = {
    register,
    authenticate,
    forgetPassword,
    resetPasswordAfterForgot,
    updatePassword
};
