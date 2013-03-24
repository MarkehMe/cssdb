
// Add helper
exports.helper = function (register) {

    // Format a number for smaller display
    register('number-format', function (context, block) {
        var num = parseInt(context, 10);
        if (num < 1000) {
            return num;
        }
        if (num < 10000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        if (num < 1000000) {
            return Math.floor(num / 1000) + 'K';
        }
        return (num / 1000000).toFixed(1) + 'M';
    });

};
