const GuestUser	= require('./../models').share_guest_users;
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = CONFIG.jwt.encryption;

const guestStrategy = new JwtStrategy(jwtOptions,async function(jwt_payload, next) {
    let err, user;
    [err, user] = await to(GuestUser.findByPk(jwt_payload.user_id));
    if(err) return next(err, false);
   	
   	if(user) {
    	user.is_guest = 1;
    	user['dataValues']['is_guest'] = 1;
        return next(null, user);
    }else{
        return next(null, false);
    }
});


module.exports = guestStrategy;