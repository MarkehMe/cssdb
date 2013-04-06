'use strict';

// Dependencies
var Browser = require("zombie");
var child_process = require('child_process');
var fs = require('fs');

// Read test environment variables
var envFile;
try {
    envFile = fs.readFileSync(__dirname + '/../../../.env.test', 'utf8');
} catch (err) {
    console.error('Missing .env.test file, please read the setup guide.')
    process.exit(1);
}

// Parse test environment variables
var testEnv = {}, prop;
for (prop in process.env) {
    testEnv[prop] = process.env[prop];
}
envFile.split(/[\n\r]+/).forEach(function (line) {
    if (line.trim() && line.indexOf('=') !== -1) {
        line = line.split('=');
        testEnv[line.shift().trim()] = line.join('=').trim();
    }
});
testEnv.PORT = testEnv.PORT || '5001';
testEnv.NODE_ENV = 'test';

// World constructor
function World (callback) {
    this.appProcess = null;
    callback();
}

// Start the application
World.prototype.startApp = function (callback) {
    var that = this;
    var callbackCalled = false;
    
    // Create browser
    this.browser = new Browser();

    // Spawn process
    this.appProcess = child_process.spawn('node', [__dirname + '/../../../app.js'], {
        env: testEnv
    });

    // Append output data to log
    this.appProcess.stdout.on('data', function (data) {
        data = data.toString();
        if (!callbackCalled && data.trim() === 'App running on port ' + testEnv.PORT) {
            callbackCalled = true;
            callback();
        }
    });

    // Append error data to log
    this.appProcess.stderr.on('data', function (data) {
        console.error('ERR: ' + data.toString());
    });

    // If the process dies, reset vars
    this.appProcess.on('exit', function () {
        if (!callbackCalled) {
            callbackCalled = true;
            callback();
        }
        that.appProcess = null;
    });

    // Kill the child process when the parent exits
    process.on('exit', function () {
        if (that.appProcess) {
            that.appProcess.kill();
        }
    });
};

// Stop the application
World.prototype.stopApp = function (callback) {
    this.browser = null;
    if (this.appProcess) {
        this.appProcess.kill();
    }
    callback();
};

// Navigate to a page
World.prototype.navigate = function (page, callback) {
    this.browser.visit('http://localhost:' + testEnv.PORT + page, function (err) {
        if (err) { return callback.fail(err); }
        callback();
    });
};

// Assert that an element contains text
World.prototype.assertElementContains = function (selector, text, callback) {
    var elemText = this.browser.text(selector);
    if (elemText.toLowerCase().indexOf(text.toLowerCase()) === -1) {
        callback.fail(new Error('Text "' + text + '" not found in "' + elemText + '"'));
    }
    callback();
};

// Assert that the current page contains some text
World.prototype.assertPageContains = function (text, callback) {
    this.assertElementContains('body', text, callback);
};

// Assert that the current page contains some text
World.prototype.assertHeadingContains = function (text, callback) {
    this.assertElementContains('h1,h2,h3,h4,h5,h6', text, callback);
};

// Exports
exports.World = World;
