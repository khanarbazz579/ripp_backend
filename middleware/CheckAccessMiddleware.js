const { havePermission, haveRole } = require('../services/PermissionService');

/**
 * Middleware function to check is current loggedin user have the supplied permissions.
 * 
 * @param {string} method Accepts array of permissions or a single permission string.
 * @param {string} access Accepts access type for the supplied permission.
 * 
 * @throws {Error} 
 * @returns {Promise}  
 */
module.exports.can = function (method, access = null) {

    if (!method) {
        return TE('Invalid route parameters!');
    } else {
        return async function (req, res, next) {
            const { user } = req;

            if(method.includes('guest')){
                return next();
            }else if (await user.isAdmin()) {
                return next();
            }

            let [err, permissions] = await to(havePermission({
                permission: method,
                user: user,
                access
            }));

            if (!permissions || err) {
                return res.status(403).json({
                    status: false,
                    message: err || 'Unauthorized access: You do not have required permissions!'
                });
            } else {
                next();
            }
        }
    }
}

/**
 * Middleware function to check if current logged in user have the supplied role.
 * 
 * @param {string} access Accepts role name.
 * 
 * @throws {Error} 
 * @returns {Promise}  
 */
module.exports.haveRole = function (role) {
    if (!role) {
        return TE('Invalid route parameters!');
    } else {
        return async function (req, res, next) {
            let [err, hasAccess] = await to(haveRole({ role: role, user: req.user }));

            if (!hasAccess || err) {
                return res.status(403).json({
                    status: false,
                    message: 'Unauthorized access: You do not have required role access!'
                });
            } else {
                next()
            }
        }
    }
}