/* global _gaq */
(function (doc, host) {
    'use strict';

    // Mouse button constants
    var MOUSE_BUTTON_LEFT = 0;
    var MOUSE_BUTTON_MIDDLE = 1;
    var MOUSE_BUTTON_RIGHT = 2;

    // Get clicked button from event (nasty, not super reliable)
    function getClickedButton (evt) {
        if (evt.button) {
            return evt.button;
        }
        return MOUSE_BUTTON_LEFT;
    }

    // Is a link external?
    function isLinkExternal (link) {
        return (link.indexOf(host) === -1 && link.match(/^https?:\/\//i));
    }

    // Bind a click tracking event
    function bindClickTrackingEvent (link) {
        if (link.href && isLinkExternal(link.href)) {
            link.onclick = function (evt) {
                var button = getClickedButton(evt || window.event);
                if (window._gaq && _gaq.push) {
                    _gaq.push(['_trackEvent', 'External Links', 'Click', link.href]);
                    setTimeout(function() {
                        if (button === MOUSE_BUTTON_LEFT) {
                            doc.location = link.href;
                        } else if (button === MOUSE_BUTTON_MIDDLE) {
                            window.open(link.href);
                        }
                    }, 100);
                    return false;
                }
            };
        }
    }

    // Get links
    var links = document.getElementsByTagName('a');

    // Outbound link click tracking
    var i, len = links.length;
    for (i = 0; i < len; i += 1) {
        bindClickTrackingEvent(links[i]);
    }

} (document, document.location.host));