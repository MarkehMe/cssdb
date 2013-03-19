
// Configure
exports.route = function (app, callback) {

    // Model shortcuts
    var library = app.model.library;

    // Home page (latest)
    app.get('/', function (req, res, next) {
        library.latest(20, function (err, libs) {
            if (err) { return next(err); }
            res.render('home', {libs: libs});
        });
    });

    // Submit a library
    app.get('/submit', function (req, res) {
        res.render('submit', {
            errors: req.flash('errors')[0] || [],
            lib: req.flash('lib')[0] || null
        });
    });

    // Submit a library
    app.post('/submit', function (req, res, next) {
        library.create(req.body, function (err, validationErrors, lib) {
            if (err) {
                return next(err);
            }
            if (validationErrors.length) {
                req.flash('lib', req.body);
                req.flash('errors', validationErrors);
                return res.redirect('/submit');
            }
            res.redirect('/submitted?repo=' + lib.owner + '/' + lib.name);
        });
    });

    // Submit a library
    app.get('/submitted', function (req, res) {
        res.render('submitted', {
            repo: req.query.repo
        });
    });

    // We're done routing
    callback();

};
