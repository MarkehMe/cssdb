
// Model
exports.getModel = function (app) {

    // Get database and collection
    var db = app.get('db');
    var collection = db.collection('libraries');

    // Model methods
    var model = {

        // Get the latest libraries
        latest: function (count, callback) {
            var cur = collection.find({active: true});
            cur.sort({created: -1}).limit(count).toArray(callback);
        },

        // Transform input into something readable by the validator/creator
        transformInput: function (input) {
            output = {};

            // Set URL and identifying details
            output.url = input.url || null;
            output.name = null;
            output.uname = null;

            // Set name if URL is valid Repo URL
            if (model.util.isValidRepoUrl(output.url)) {
                var repoInfo = model.util.getRepoInfoFromUrl(output.url);
                output.name = repoInfo.name;
                output.uname = repoInfo.username;
            }

            // 'Untouchable' data
            output.active = true; // temporary
            output.created = new Date();

            return output
        },

        // Validate input to create a new library
        validate: function (input, callback) {
            var errors = [];

            // Validate URL (which in turn validates name/uname)
            if (!model.util.isValidRepoUrl(output.url)) {
                errors.push('Please enter a valid GitHub repository URL');
            }

            callback(null, errors, input);
        },

        // Create a new library
        create: function (input, callback) {
            model.validate(model.transformInput(input), function (err, validationErrors, newLib) {
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
        },

        // Model utilities
        util: {

            repoUrlRegExp: /^https?:\/\/(www\.)?github\.com\/([a-z0-9][a-z0-9\-]{0,39})\/([a-z0-9\-]{1,100})\/?$/i,

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
                    username: matches[2],
                    name: matches[3]
                };
            }

        }

    };

    return model;
};
