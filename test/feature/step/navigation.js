'use strict';

// Step definitions
module.exports = function () {
    this.World = require('../support/world').World;

    this.Given(/^I am on the home page$/i, function (callback) {
        this.navigate('/', callback);
    });

    this.Given(/^I am on the recently added libraries page$/i, function (callback) {
        this.navigate('/latest', callback);
    });

    this.Given(/^I am on the submit page$/i, function (callback) {
        this.navigate('/submit', callback);
    });

    this.When(/^I navigate to "([^"]*)"$/i, function (url, callback) {
        this.navigate(url, callback);
    });

};
