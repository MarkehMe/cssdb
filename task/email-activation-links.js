
// Dependencies
var async = require('async');
var CronJob = require('cron').CronJob;
var nodemailer = require('nodemailer');

// Initialise task
exports.initTask = function (app) {
    var library = app.model.library;

    // Email activation links for recently created libraries
    function task () {
        console.log('Emailing activation links');

        // No email settings?
        if (!app.get('smtp-host')) {
            return console.error('SMTP settings not found, not sending email');
        }

        // Get libraries
        library.awaitingNotification(function (err, libs) {
            if (err) {
                return console.error('No links emailed: ' + err.message);
            }
            if (!libs.length) {
                return console.log('No new libraries found');
            }

            // Compose email
            var emailText = 'The following libraries are awaiting activation:';
            libs.forEach(function (lib) {
                emailText += '\n\n' + lib.owner + '/' + lib.name + '\nRepo URL: ' + lib.url + '\nActivate: ' + app.get('baseUrl') + '/activate?key=' + lib.key
            });

            // Create mail transport
            var transport = nodemailer.createTransport('SMTP', {
                host: app.get('smtp-host'),
                auth: {
                    user: app.get('smtp-user'),
                    pass: app.get('smtp-pass')
                }
            });

            // Send email
            transport.sendMail({
                to: app.get('email-recipient'),
                from: app.get('email-sender'),
                subject: 'CSSDB: New Libraries Awaiting Activation',
                text: emailText
            }, function (err, response) {
                if (err) {
                    return console.error('No links emailed: ' + err.message);
                }
                transport.close();
                console.log(libs.length + ' links emailed');
                library.markAsNotified(libs, function (err, count) {
                    if (err) {
                        return console.error('Link notification status not updated: ' + err.message);
                    }
                });
            });
        });
    }

    // Cron job
    var job = new CronJob('0 0 */1 * * *', task);
    job.start();

};
