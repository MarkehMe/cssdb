
// Dependencies
var moment = require('moment');

// Add helper
exports.helper = function (register) {

    // Format a date with Moment
    register('date-format', function (context, block) {
        var format = block.hash.format || "YYYY-MM-DD HH:mm:ss";
        return moment(context).format(format);
    });

    // Get a relative date
    register('date-relative', function (context, block) {
        return moment(context).fromNow();
    });

};
