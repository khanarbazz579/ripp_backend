//instantiate configuration variables
require('./config/config');
require('./global_functions'); //instantiate global functions

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');

const api = require('./routes/api');

const app = express();

const Raven = require('raven');
Raven.config('https://36c6422bfac14d6885ffd3dc91147dba@sentry.io/1209389', {
    //autoBreadcrumbs: true,
    captureUnhandledRejections: true,

}).install(function(err, sendErr, eventId) {
    if (!sendErr) {
        console.log('Successfully sent fatal error with eventId ' + eventId + ' to Sentry:');
        console.error(err.stack);
    }
    console.log('This is thy sheath; there rust, and let me die.');
    process.exit(1);
});
// The request handler must be the first middleware on the app
app.use(Raven.requestHandler());

// The error handler must be before any other error middleware
app.use(Raven.errorHandler());
// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + '\n');
});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//Passport
app.use(passport.initialize());
//DATABASE
const models = require("./models");

models.sequelize.authenticate().then(() => {
    console.log('Connected to SQL database:', CONFIG.db.name);
})
    .catch(err => {
        Raven.captureException(err);
        console.error('Unable to connect to SQL database:', CONFIG.db.name, err);
    });

if (CONFIG.app.name === 'dev') {
    // models.sequelize.sync(); //creates table if they do not already exist
    // models.sequelize.sync({ force: true });//deletes all tables then recreates them useful for testing and development purposes
}
// CORS
app.use(require('./middleware/CorsMiddleware'));
app.use(require('./middleware/RoleAccessMiddleware'))

app.use('/api', api);

app.use('/', function (req, res) {
    res.statusCode = 200; //send the appropriate status code
    res.json({
        status: "success",
        message: "Parcel Pending API",
        data: {}
    })
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    //res.status(err.status || 500);
    // res.render('error');
});

module.exports = app;