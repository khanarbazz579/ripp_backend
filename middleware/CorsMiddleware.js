const models = require('../models');

module.exports = async function (req, res, next) {

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type, X-Role-Access');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if(req.originalUrl.includes('/api/rta/form/p')) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*'); 
        return next();
    }

    const allowedOrigins = await models.analytic_apps.findAll({
        attributes: ['url']
    }).map(app => app.url);
    
    let origin = process.env.NODE_ENV_HEADER === 'local' ? 'http://localhost:4200' : 'https://frontend.devsubdomain.com';

    if(allowedOrigins.includes(req.headers.origin) ) {
        origin = req.headers.origin;
    } 

    res.setHeader('Access-Control-Allow-Origin', origin);

    next();
}

// app.use(async function (req, res, next) {

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type, X-Role-Access');
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     if(req.originalUrl.includes('/api/rta/form/p')) {
//         console.log("req.headers.origin", req.originalUrl.includes('/api/rta/form/p'), req.originalUrl);
//         res.setHeader('Access-Control-Allow-Origin', req.headers.origin); 
//         return next();
//     }

//     const allowedOrigins = await models.analytic_apps.findAll({
//         attributes: ['url']
//     }).map(app => app.url);
    
//     let origin = process.env.NODE_ENV_HEADER === 'local' ? 'http://localhost:4200' : 'https://frontend.devsubdomain.com';

//     if(allowedOrigins.includes(req.headers.origin) ) {
//         origin = req.headers.origin;
//     } 
//     // // Website you wish to allow to connect
//     // if (process.env.NODE_ENV_HEADER === 'local') {
//         // will comment out later. @pratik
//         res.setHeader('Access-Control-Allow-Origin', origin); // for local only
//     // } else {
//     //     res.setHeader('Access-Control-Allow-Origin', [...allowedOrigins, 'https://frontend.devsubdomain.com']);
//     // }
//     // Pass to next layer of middleware
//     next();
// });
