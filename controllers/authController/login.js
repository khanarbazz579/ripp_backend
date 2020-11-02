const authService = require('./../../services/AuthService');
const { ROLES } = require('../../constants/permissions');

const login = async function (req, res) {
    const body = req.body;
    let err, user;
    let userIpAddress = req.connection.remoteAddress;
    let userBrowser = req.headers['user-agent'];
    [err, user] = await to(authService.authUser(req.body));
    if (err) return ReE(res, err, 422);

    let permission_set = await user.getPermissionSet();
    let response = {
        token: user.getJWT(),
        user: {
            isAdmin: await user.isAdmin(),
            ...user.toWeb()
        },
        access: {
            role: await user.getRole(),
            permissions: permission_set.id ? await user.getPermissionsFromSet() : await user.getPermissions(),
            set: permission_set
        }
    };
    if (user) {
        user = user.toJSON();
        if (user.is_secure_access) {
            let [aerr, authData] = await authService.checkUserAuthentication(user.id, userIpAddress, userBrowser);
            if (aerr) return ReE(res, err, 422); // Return error in authentication
            if (!authData) {
                let authCode = Math.floor(100000 + Math.random() * 900000);
                let [autherror, result] = await authService.createTwoFactorAuthenticationRequest({
                    user_id: user.id,
                    browser: userBrowser,
                    location: '',
                    ip_address: userIpAddress,
                    auth_code: authCode,
                    status: false
                });
                if (autherror) {
                    return ReE(res, autherror, 422);
                }
                return ReS(res, {
                    status: true,
                    is_auth_required: true,
                    auth_code: authCode,
                    user_id: user.id
                });
            }
        }
    }

    return ReS(res, response);
}
module.exports.login = login;


const verifyAuthentication = async (req, res) => {
    const body = req.body;
    let [verr, user] = await authService.verifyAuthentication(body);
    if (verr) return ReE(res, verr, 422);
    let permission_set = await user.getPermissionSet();
    let response = {
        token: user.getJWT(),
        user: {
            isAdmin: await user.isAdmin(),
            ...user.toWeb()
        },
        access: {
            role: await user.getRole(),
            permissions: permission_set.id ? await user.getPermissionsFromSet() : await user.getPermissions(),
            set: permission_set
        }
    };
    return ReS(res, response);
}

module.exports.verifyAuthentication = verifyAuthentication;