'use strict';

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

        // Get the most popular libraries
        popular: function (count, callback) {
            collection
                .find({active: true, repo: {$ne: null}})
                .sort({'repo.popularity': -1})
                .limit(count)
                .toArray(callback);
        },

        // Get the latest libraries
        latest: function (count, callback) {
            collection
                .find({active: true, repo: {$ne: null}})
                .sort({created: -1})
                .limit(count)
                .toArray(callback);
        },

        // Search for libraries
        search: function (query, callback) {
            if (!query.q) {
                return callback(null, []);
            }

            // Build regexp
            var q = query.q.split(/\s+/).map(function (word) {
                return word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            }).join('|');
            var regexp = new RegExp('(' + q + ')', 'gi');

            collection
                .find({
                    active: true,
                    repo: {$ne: null},
                    $or: [
                        {name: regexp},
                        {owner: regexp},
                        {'repo.description': regexp}
                    ]
                })
                .sort({'repo.popularity': -1})
                .toArray(callback);
        },

        // Get outdated libraries
        outdated: function (count, callback) {
            var today = new Date();
            var twoDaysAgo = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                today.getHours() - 48
            );
            collection
                .find({
                    active: true,
                    repo: {$ne: null},
                    updated: {$lte: twoDaysAgo}
                })
                .sort({updated: 1})
                .limit(count)
                .toArray(callback);
        },

        // Get libraries that haven't had a notification email sent yet
        awaitingNotification: function (callback) {
            collection
                .find({notified: false})
                .sort({created: -1})
                .toArray(callback);
        },

        // Transform input into something readable by the validator/creator
        transformInput: function (input, callback) {
            var output = {};

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
            output.notified = false;
            output.created = new Date();
            output.updated = new Date();
            output.repo = null;

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
            if (!model.util.isValidRepoUrl(input.url)) {
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
                    model.util.isRepoAdded(input.owner, input.name, function (err, alreadyExists) {
                        if (alreadyExists) {
                            errors.push('The library you entered has already been submitted');
                        }
                        next(err);
                    });
                },

                // Check that the repo actually exists
                function (next) {
                    model.util.getGitHubRepo(input.owner, input.name, function (err, repo) {
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
                return callback(null, false);
            }
            collection.findOne({key: key}, function (err, lib) {
                if (err || !lib) {
                    return callback(err, false);
                }
                model.util.getGitHubRepo(lib.owner, lib.name, function (err, repo) {
                    if (err || !repo) {
                        return callback(err, false);
                    }
                    collection.update({_id: lib._id}, {
                        $set: {
                            active: true,
                            updated: new Date(),
                            repo: repo
                        }
                    }, function (err, count) {
                        return callback(err, (count > 0));
                    });
                });
            });
        },

        // Mark libraries as notified
        markAsNotified: function (libs, callback) {
            var ids = libs.map(function (lib) {
                return lib._id;
            });
            collection.update({_id: {$in: ids}}, {$set: {notified: true}}, {multi: true}, callback);
        },

        // Refresh a library's repo details
        refresh: function (lib, callback) {
            model.util.getGitHubRepo(lib.owner, lib.name, function (err, repo) {
                if (err || !repo) {
                    return callback(err, false);
                }
                collection.update({_id: lib._id}, {
                    $set: {
                        updated: new Date(),
                        repo: repo
                    }
                }, function (err, count) {
                    return callback(err, (count > 0));
                });
            });
        },

        // Recalculate all libraries repo popularities
        // (you get nothing back from this, it's hit and hope)
        recalculatePopularity: function () {
            var cursor = collection.find({active: true, repo: {$ne: null}});
            cursor.each(function(err, lib) {
                if (err || !lib) { return; }
                model.util.calculateRepoPopularity(lib.repo);
                collection.update({_id: lib._id}, {
                    $set: {
                        'repo.popularity': lib.repo.popularity
                    }
                }, function () {
                    // nothing here...
                });
            });
        },

        // Model utilities
        util: {

            repoUrlRegExp: new RegExp(
                '^https?:\\/\\/(www\\.)?github\\.com\\/' +
                '([a-z0-9][a-z0-9\\-]{0,39})\\/([a-z0-9\\-\\.]{1,100})\\/?$',
            'i'),

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
                github.get('/repos/' + owner + '/' + name, function (err, status, repo) {
                    if (err || !repo) {
                        return callback(err, null);
                    }

                    // Sanitize home page
                    var homepage = repo.homepage;
                    if (homepage && /^[a-z]+:\/\//i.test(homepage) !== true) {
                        homepage = 'http://' + homepage;
                    }

                    // Format repo
                    var repoFormatted = {
                        id: repo.id,
                        ownerId: repo.owner.id,
                        ownerAvatar: repo.owner.avatar_url,
                        description: repo.description,
                        homepage: homepage,
                        branch: repo.master_branch,
                        forks: repo.forks_count,
                        stars: repo.watchers_count,
                        created: new Date(repo.created_at),
                        updated: new Date(repo.updated_at),
                        pushed: new Date(repo.pushed_at)
                    };
                    model.util.calculateRepoPopularity(repoFormatted);
                    callback(err, repoFormatted);
                });
            },

            // Calculate a GitHub repository's popularity
            calculateRepoPopularity: function (repo) {
                // Todo: work out a nicer algorithm some time

                // Initial counts
                var popularity = repo.stars;
                popularity += (repo.forks * 2);

                // Last updated modifiers
                var now = new Date();
                var timeDiff = (now.getTime() - repo.updated.getTime()) / 1000;
                var hoursDiff = Math.floor(timeDiff / 3600);
                var timeDeduction = 0;
                if (hoursDiff > 0) {

                    // Minus 0.1% per hour inactive
                    timeDeduction = ((popularity / 1000) * hoursDiff);

                    // Limit deduction to at most 50% of the original popularity
                    timeDeduction = Math.min(timeDeduction, (popularity / 2));

                    popularity -= timeDeduction;
                }

                // Add to repo
                repo.popularity = Math.max(Math.floor(popularity), 0);

            }

        }

    };

    return model;
};
