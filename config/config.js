
// Dependencies
var express = require('express');
var hbs = require('express-hbs');
var sass = require('node-sass');

// Configure
exports.configure = function (app, callback) {

    // Grab some useful app info
    var appDir = app.get('dir');
    var appEnv = app.get('env');
    var isProduction = (appEnv === 'production');

    // Get basic config from JSON
    var config = require('./config.json');

    // Set the application port
    app.set('port', (process.env.PORT || config.port));

    // Compile Sass styles
    app.use(sass.middleware({
        src: appDir + '/asset',
        dest: appDir + '/public',
        output_style: (isProduction ? 'compressed' : 'nested')
    }));

    // Static file directory
    var staticMaxAge = (isProduction ? config.staticMaxAge : 0); // 1 week
    app.use(express.static(appDir + '/public', {maxAge: staticMaxAge}));

    // Compress responses with gzip/deflate
    app.use(express.compress());

    // Request/response config
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

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

    // Merge config with default view variables
    app.locals(config);

    // Set some useful dynamic view variables
    app.locals({
        year: (new Date()).getFullYear()
    });

    // We're done configuring
    callback();

};