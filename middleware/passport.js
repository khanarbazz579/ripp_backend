const User	= require('./../models').users;
const GuestUser	= require('./../models').share_guest_users;
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = CONFIG.jwt.encryption;

const strategy = new JwtStrategy(jwtOptions,async function(jwt_payload, next) {
    let err, user;

    if(jwt_payload.user_type && jwt_payload.user_type == "SHARED_GUEST"){
    	[err, user] = await to(GuestUser.findByPk(jwt_payload.user_id));
    	
        if(err) return next(err, false);

        user.is_guest = 1;
        user['dataValues']['is_guest'] = 1;
    }else{
    	[err, user] = await to(User.findByPk(jwt_payload.user_id));

        if(err) return next(err, false);
        
    	user.is_guest = 0;
        user['dataValues']['is_guest'] = 0;
    }
    if(user) {
        return next(null, user);
    }else{
        return next(null, false);
    }
});


module.exports = strategy;