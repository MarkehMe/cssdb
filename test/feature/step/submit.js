'use strict';

// Step definitions
module.exports = function () {
    this.World = require('../support/world').World;

    this.Given(/^the library "([^"]*)" has been added$/, function (libUrl, callback) {
        var matches = libUrl.match(new RegExp(
            '^https?:\\/\\/(www\\.)?github\\.com\\/' +
            '([a-z0-9][a-z0-9\\-]{0,39})\\/([a-z0-9\\-\\.]{1,100})\\/?$',
        'i'));
        var owner = matches[2];
        var name = matches[3];
        this.db.collection('libraries').insert({
            url: libUrl,
            name: name,
            owner: owner,
            active: false,
            notified: false,
            key: 'test-activation-key'
        }, function (err) {
            if (err) { return callback.fail(err); }
            callback();
        });
    });

    this.When(/^I submit the submission form with "([^"]*)"$/i, function (libUrl, callback) {
        this.browser
            .fill('url', libUrl)
            .pressButton('Submit Library', callback);
    });

    this.Then(/^the library "([^"]*)" should be added$/i, function (libUrl, callback) {
        this.db.collection('libraries').findOne({url: libUrl}, function (err, repo) {
            if (err) { return callback.fail(err); }
            if (!repo) {
                return callback.fail(new Error('Repository "' + libUrl + '" was not added'));
            }
            callback();
        });
    });

    this.Then(/^the library "([^"]*)" should not be added$/i, function (libUrl, callback) {
        this.db.collection('libraries').findOne({url: libUrl}, function (err, repo) {
            if (err) { return callback.fail(err); }
            if (repo) {
                return callback.fail(new Error('Repository "' + libUrl + '" was added'));
            }
            callback();
        });
    });

    this.Then(/^the library "([^"]*)" should be inactive$/i, function (libUrl, callback) {
        this.db.collection('libraries').findOne({url: libUrl}, function (err, repo) {
            if (err) { return callback.fail(err); }
            if (!repo) {
                return callback.fail(new Error('Repository "' + libUrl + '" was not added'));
            }
            if (repo.active) {
                return callback.fail(new Error('Repository "' + libUrl + '" is active'));
            }
            callback();
        });
    });

    this.Then(/^the library "([^"]*)" should be active$/i, function (libUrl, callback) {
        this.db.collection('libraries').findOne({url: libUrl}, function (err, repo) {
            if (err) { return callback.fail(err); }
            if (!repo) {
                return callback.fail(new Error('Repository "' + libUrl + '" was not added'));
            }
            if (!repo.active) {
                return callback.fail(new Error('Repository "' + libUrl + '" is not active'));
            }
            callback();
        });
    });

};
