(function (doc, host) {

    // Is a link external?
    function isLinkExternal (link) {
        return (link.indexOf(host) == -1 && link.match(/^https?:\/\//i));
    }

    // Bind a click tracking event
    function bindClickTrackingEvent (link) {
        if (link.href && isLinkExternal(link.href)) {
            link.onclick = function () {
                if (_gaq && _gaq.push) {
                    _gaq.push(['_trackEvent', 'External Links', 'Click', link.href]);
                    setTimeout(function() {
                        doc.location = link.href;
                    }, 100);
                    return false;
                }
            }
        }
    }

    // Get links
    var links = document.getElementsByTagName('a');

    // Outbound link click tracking
    var i, len = links.length;
    for (i = 0; i < len; i++) {
        bindClickTrackingEvent(links[i]);
    }

} (document, document.location.host));