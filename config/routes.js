
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

    // Search
    app.get('/search', function (req, res, next) {
        library.search(req.query, function (err, libs) {
            if (err) { return next(err); }
            res.render('search', {libs: libs, query: req.query});
        });
    });

    // Submit a library
    app.get('/submit', function (req, res) {
        res.render('submit');
    });

    // Submit a library
    app.post('/submit', function (req, res, next) {
        library.create(req.body, function (err, validationErrors, lib) {
            if (err) {
                return next(err);
            }
            if (validationErrors.length) {
                return res.render('submit', {
                    errors: validationErrors,
                    lib: req.body || null
                });
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

    // Activate a submitted library
    app.get('/activate', function (req, res, next) {
        library.activate(req.query.key, function (err, wasActivated) {
            if (err) { return next(err); }
            if (!wasActivated) {
                return res.json(400, {
                    success: false,
                    error: 'Invalid activation key'
                });
            }
            res.json({
                success: true
            });
        });
    });

    // 404 errors
    app.use(function (req, res) {
        res.send(404, 'Not Found'); // Todo
    });

    // 50x errors
    app.use(function (err, req, res, next) {
        res.send(500, 'Server Error:<br/>' + err.stack); // Todo
    });

    // We're done routing
    callback();

};
