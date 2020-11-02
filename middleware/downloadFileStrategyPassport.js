const User	= require('../models').users;
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('secret_token')
jwtOptions.secretOrKey = CONFIG.jwt.encryption;

const downloadFileStrategy = new JwtStrategy(jwtOptions,async function(jwt_payload, next) {
    let err, user;
    [err, user] = await to(User.findByPk(jwt_payload.user_id));
    if(err) return next(err, false);
    if(user) {
        return next(null, user);
    }else{
        return next(null, false);
    }
});


module.exports = downloadFileStrategy;
