'use strict';

// Step definitions
module.exports = function () {
    this.World = require('../support/world').World;

    this.Then(/^I should see "([^"]*)"$/i, function (text, callback) {
        this.assertPageContains(text, callback);
    });

    this.Then(/^I should see "([^"]*)" in a heading$/i, function (text, callback) {
        this.assertHeadingContains(text, callback);
    });

};
