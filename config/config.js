
// Dependencies
var express = require('express');
var hbs = require('express-hbs');

// Configure
exports.configure = function (app, callback) {

    // Grab some useful app info
    var pkg = app.get('pkg');
    var appDir = app.get('dir');
    var appEnv = app.get('env');
    var isProduction = (appEnv === 'production');

    // Set the application port
    app.set('port', (process.env.PORT || 5000));
    app.set('host', (process.env.HOST || 'localhost'));
    app.set('baseUrl', 'http://' + app.get('host') + (isProduction ? '' : ':' + app.get('port')));

    // Set database connection details
    app.set('db-connection-string', (process.env.DB || 'mongodb://localhost/cssdb'));

    // Set GitHub details
    app.set('github-client-id', (process.env.GITHUB_CLIENT_ID || null));
    app.set('github-client-secret', (process.env.GITHUB_CLIENT_SECRET || null));

    // Set email details
    app.set('email-recipient', (process.env.EMAIL_RECIPIENT || null));
    app.set('email-sender', (process.env.EMAIL_SENDER || null));
    app.set('smtp-host', (process.env.SMTP_HOST || null));
    app.set('smtp-user', (process.env.SMTP_USER || null));
    app.set('smtp-pass', (process.env.SMTP_PASS || null));

    // Static file directory
    var staticMaxAge = (isProduction ? 604800 : 0); // 1 week
    app.use(express.static(appDir + '/public', {maxAge: staticMaxAge}));

    // Compress responses with gzip/deflate
    app.use(express.compress());

    // Request/response config
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // Disable X-Powered-By: Express
    app.disable('x-powered-by');

    // View settings
    app.set('views', appDir + '/view');
    app.engine('html', hbs.express3({
        extname: ".html",
        layoutsDir: appDir + '/view/layout',
        partialsDir: appDir + '/view/partial',
        defaultLayout: appDir + '/view/layout/default'
    }));
    app.set('view engine', 'html');
    hbs.registerHelper('fill', hbs.handlebars.helpers.contentFor);

    // Load/register additional helpers
    require('../view/helper/date').helper(hbs.registerHelper);

    // Set some useful dynamic view variables
    app.locals({

        // Meta information
        lang: 'en',

        // URLs
        baseUrl: app.get('baseUrl'),

        // Current dates
        year: (new Date()).getFullYear(),

        // Asset suffixes
        min: (isProduction ? '.min' : ''),
        cacheBuster: '?v=' + pkg.version

    });

    // We're done configuring
    callback();

};