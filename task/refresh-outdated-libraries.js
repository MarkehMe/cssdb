'use strict';

// Dependencies
var async = require('async');
var CronJob = require('cron').CronJob;

// Initialise task
exports.initTask = function (app) {
    var library = app.model.library;

    // Refresh 5 most outdated libraries
    function task () {
        console.log('Updating outdated libraries');
        library.outdated(5, function (err, libs) {
            if (err) {
                return console.error('No libraries updated: ' + err.message);
            }
            async.each(libs, function (lib, callback) {
                var libName = lib.owner + '/' + lib.name;
                library.refresh(lib, function (err, wasUpdated) {
                    if (err) {
                        return callback(err);
                    }
                    if (!wasUpdated) {
                        return callback(new Error('Library ' + libName + ' was not updated'));
                    }
                    console.log('Library ' + libName + ' was updated');
                    callback();
                });
            }, function (err) {
                if (err) {
                    return console.error('Error occurred: ' + err.message);
                }
                console.log('Finished updating');
            });
        });
    }

    // Cron job
    var job = new CronJob('0 */20 * * * *', task);
    job.start();

};
