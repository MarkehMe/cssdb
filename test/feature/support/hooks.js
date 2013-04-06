'use strict';

// Hooks
module.exports = function () {

    // Before each scenario
    this.Before(function (callback) {
        this.startApp(callback);
    });

    // After each scenario
    this.After(function (callback) {
        this.stopApp(callback);
    });

};
