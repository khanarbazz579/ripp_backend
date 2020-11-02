module.exports = async function (req, res, next) {

    let { headers } = req;
    
    if(headers['x-role-access']) {
        let access = Buffer.from(headers['x-role-access'], 'base64').toString();;
        access = JSON.parse(access);
        req.roleAccess = {
            users: access.users,
            roles: access.roles,
            isActive: !!(access.users.length)
        }
    } else {
        req.roleAccess = {
            users: [],
            roles: [],
            isActive: false
        };
    }

    console.info('Active roles access => ', req.roleAccess);

    next();

}