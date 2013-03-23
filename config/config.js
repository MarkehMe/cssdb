
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

    // Get basic config from JSON
    var config = require('./config.json');

    // Set the application port
    app.set('port', (process.env.PORT || config.port));

    // Set database connection details
    app.set('db-connection-string', (process.env.DB || 'mongodb://localhost/cssdb'));

    // Set GitHub details
    app.set('github-client-id', (process.env.GITHUB_CLIENT_ID || null));
    app.set('github-client-secret', (process.env.GITHUB_CLIENT_SECRET || null));

    // Static file directory
    var staticMaxAge = (isProduction ? config.staticMaxAge : 0); // 1 week
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

    // Merge config with default view variables
    app.locals(config);

    // Set some useful dynamic view variables
    app.locals({

        // Current dates
        year: (new Date()).getFullYear(),

        // Asset suffixes
        min: (isProduction ? '.min' : ''),
        cacheBuster: '?v=' + pkg.version

    });

    // We're done configuring
    callback();

};