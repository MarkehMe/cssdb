
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
            output.url = input.url || null;
            output.active = true; // temporary
            return output
        },

        // Validate input to create a new library
        validate: function (input, callback) {
            var errors = [];
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
        }

    };

    return model;
};
