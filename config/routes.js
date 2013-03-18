
// Configure
exports.route = function (app, callback) {

    // Home route
    app.get('/', function (req, res) {
        res.render('home');
    });

    // We're done routing
    callback();

};
