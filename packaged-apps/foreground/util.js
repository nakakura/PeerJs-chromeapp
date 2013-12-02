///<reference path="./http/http.ts"/>
///<reference path="./jquery.d.ts"/>
//static class
var Util = (function () {
    function Util() {
    }
    Util.randomId = function () {
        return Math.random().toString(36).substr(2);
    };

    Util.prettyError = function (msg) {
        if (Util.debug) {
            console.log('ERROR PeerServer: ', msg);
        }
    };

    Util.log = function () {
        var message = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            message[_i] = arguments[_i + 0];
        }
        if (Util.debug) {
            console.log.apply(console, message);
        }
    };

    Util.chompNull = function (array) {
        function sub(counter, subArray) {
            if (counter >= subArray.length)
                return subArray;
else if (subArray[counter] === "") {
                subArray.splice(counter, 1);
                return sub(counter, subArray);
            } else {
                return sub(counter + 1, subArray);
            }

            return subArray;
        }

        return sub(0, array);
    };

    Util.parseDir = function (path) {
        var array = path.split("/");
        return Util.chompNull(array);
    };

    Util.targetParams = function (src) {
        var array = Util.parseDir(src);
        var keyArray = [];
        var counterArray = [];

        jQuery.each(array, function (i, item) {
            if (item.indexOf(":") == 0) {
                keyArray.push(item.substr(1));
                counterArray.push(i);
            }
        });

        return new ParseTargetItem(keyArray, counterArray);
    };

    Util.parseParams = function (src, targets) {
        var array = Util.parseDir(src);
        var keyArray = [];
        var counterArray = [];

        jQuery.each(array, function (i, item) {
            if (item.indexOf(":") == 0) {
                keyArray.push(item.substr(1));
                counterArray.push(i);
            }
        });

        return new ParseTargetItem(keyArray, counterArray);
    };

    Util.parseUrl = function (url) {
        function parseItem(counter, itemArray) {
            if (itemArray.length == 0 || counter >= itemArray.length)
                return {};

            var params = itemArray[counter].split("?");
            var hash = {};
            if (params.length == 2)
                hash[params[0]] = params[1];
            return jQuery.extend(hash, parseItem(counter + 1, itemArray));
        }

        var paramArray = url.split("=");
        return parseItem(0, paramArray);
    };
    Util.debug = false;
    return Util;
})();

var ParseTargetItem = (function () {
    function ParseTargetItem(targetKeys, targetPos) {
        this.targetKeys = targetKeys;
        this.targetPos = targetPos;
    }
    return ParseTargetItem;
})();
//# sourceMappingURL=util.js.map
