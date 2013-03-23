
// Dependencies
var async = require('async');
var crypto = require('crypto');

// Model
exports.getModel = function (app) {

    // Get database and collection
    var db = app.get('db');
    var github = app.get('github');
    var collection = db.collection('libraries');

    // Model methods
    var model = {

        // Get the latest libraries
        latest: function (count, callback) {
            collection
                .find({active: true})
                .sort({created: -1})
                .limit(count)
                .toArray(callback);
        },

        // Transform input into something readable by the validator/creator
        transformInput: function (input, callback) {
            output = {};

            // Set URL and identifying details
            output.url = input.url || null;
            output.name = null;
            output.owner = null;

            // Set name/owner if URL is valid Repo URL
            if (model.util.isValidRepoUrl(output.url)) {
                var repoInfo = model.util.getRepoInfoFromUrl(output.url);
                output.name = repoInfo.name;
                output.owner = repoInfo.owner;
                // Normalize the URL while we're at it
                output.url = 'https://github.com/' + output.owner + '/' + output.name;
            }

            // 'Untouchable' data
            output.active = false;
            output.created = new Date();

            // Create activation key
            output.key = null;
            crypto.randomBytes(12, function(err, buffer) {
                if (err) {
                    return callback(err, output);
                }

                // Set key
                output.key = buffer.toString('hex') + ':' + output.owner + ':' + output.name;

                // All done
                callback(null, output);
            });
        },

        // Validate input to create a new library
        validate: function (input, callback) {
            var errors = [];

            // Validate URL (which in turn validates name/owner)
            if (!model.util.isValidRepoUrl(output.url)) {
                errors.push('Please enter a valid GitHub repository URL');
            }

            // Basic checking done, return before we do anything expensive
            if (errors.length) {
                return callback(null, errors, input);
            }

            // DB/API checks
            async.series([

                // Check whether the repository has been added already
                function (next) {
                    model.util.isRepoAdded(output.owner, output.name, function (err, alreadyExists) {
                        if (alreadyExists) {
                            errors.push('The library you entered has already been submitted')
                        }
                        next(err);
                    });
                },

                // Check that the repo actually exists
                function (next) {
                    model.util.getGitHubRepo(output.owner, output.name, function (err, repo) {
                        if (!repo) {
                            errors.push(
                                'We couldn\'t find the GitHub repository for your library. ' +
                                'GitHub may be down, but check your spelling just in case'
                            );
                        }
                        next();
                    });
                }

            ], function (err) {
                callback(err, errors, input);
            });

        },

        // Create a new library
        create: function (input, callback) {
            model.transformInput(input, function (err, transformedInput) {
                if (err) {
                    return callback(err, [], null);
                }
                model.validate(transformedInput, function (err, validationErrors, newLib) {
                    if (err) {
                        return callback(err, [], null);
                    }
                    if (validationErrors.length) {
                        return callback(null, validationErrors, null);
                    }
                    collection.insert(newLib, function (err, libs) {
                        callback(err, [], libs[0] || null);
                    });
                });
            });
        },

        // Activate a library
        activate: function (key, callback) {
            if (typeof key !== 'string') {
                return callback(null, null);
            }
            collection.update({key: key}, {$set: {active: true}}, function (err, count) {
                return callback(err, (count > 0));
            });
        },

        // Model utilities
        util: {

            repoUrlRegExp: /^https?:\/\/(www\.)?github\.com\/([a-z0-9][a-z0-9\-]{0,39})\/([a-z0-9\-\.]{1,100})\/?$/i,

            // Return whether a value is a valid Repo URL
            isValidRepoUrl: function (val) {
                if (typeof val !== 'string') {
                    return false;
                }
                return model.util.repoUrlRegExp.test(val);
            },

            // Get information from a Repo URL
            getRepoInfoFromUrl: function (url) {
                var matches = url.match(model.util.repoUrlRegExp);
                return {
                    owner: matches[2],
                    name: matches[3]
                };
            },

            // Get whether a repository has already been added
            isRepoAdded: function (owner, name, callback) {
                collection.findOne({
                    owner: owner,
                    name: name
                }, function (err, lib) {
                    if (err) { return callback(err); }
                    callback(null, !!lib);
                });
            },

            // Get a GitHub repository
            getGitHubRepo: function (owner, name, callback) {
                github.get('/repos/' + owner + '/' + name, callback);
            }

        }

    };

    return model;
};
