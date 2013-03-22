
// Dependencies
var async = require('async');
var express = require('express');
var github = require('octonode');
var MongoClient = require('mongodb').MongoClient;
var pkg = require('./package');

// Create application
var app = express();

// Set some core vars
app.set('pkg', pkg);
app.set('name', pkg.name);
app.set('version', pkg.version);
app.set('dir', __dirname);

// Boot application
async.series([

    // Basic configuration
    function (next) {
        require('./config/config').configure(app, next);
    },

    // Connect to database
    function (next) {
        var opts = {
            server: {
                auto_reconnect: true
            }
        };
        MongoClient.connect(app.get('db-connection-string'), opts, function (err, db) {
            app.set('db', db);
            next(err);
        });
    },

    // Create GitHub client
    function (next) {
        var client;
        var clientId = app.get('github-client-id');
        var clientSecret = app.get('github-client-secret');
        if (clientId === null || clientSecret === null) {
            client = github.client();
        } else {
            client = github.client({
                id: app.get('github-client-id'),
                secret: app.get('github-client-secret')
            });
        }
        app.set('github', client);
        next();
    },

    // Load models
    function (next) {
        app.model = {
            library: require('./model/library').getModel(app)
        };
        next();
    },

    // Load routes
    function (next) {
        require('./config/routes').route(app, next);
    },

    // Start listening
    function (next) {
        app.listen(app.get('port'), next);
    }

], done);

// Once booting is complete...
function done (err) {
    if (err) { 
        console.error('App did not boot: ' + err.message);
        process.exit(1);
    }
    console.log('App running on port ' + app.get('port'));
}
