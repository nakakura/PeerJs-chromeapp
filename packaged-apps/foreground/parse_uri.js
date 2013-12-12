///<reference path="./http/http.ts"/>
///<reference path="./jquery.d.ts"/>
var ParseUri = (function () {
    function ParseUri() {
    }
    ParseUri.chompNull = function (array) {
        function sub(counter, subArray) {
            if (counter >= subArray.length)
                return subArray;
else if (subArray[counter] === "") {
                subArray.splice(counter, 1);
                return sub(counter, subArray);
            } else {
                return sub(counter + 1, subArray);
            }
        }

        return sub(0, array);
    };

    ParseUri.parseDir = function (path) {
        var array = path.split("/");
        return ParseUri.chompNull(array);
    };

    ParseUri.targetParams = function (src) {
        var array = ParseUri.parseDir(src);
        var keyArray = [];
        var counterArray = [];

        jQuery.each(array, function (i, item) {
            if (item.indexOf(":") == 0) {
                keyArray.push(item.substr(1));
                counterArray.push(i);
            }
        });

        var item = new ParseTargetItem(array, keyArray, counterArray);
        item.srcPath = src;
        return item;
    };

    ParseUri.isMatchParams = function (src, target) {
        var array = ParseUri.parseDir(src);
        if (array.length != target.srcParams.length)
            return false;
else if (array[array.length - 1].indexOf(target.method()) !== 0)
            return false;
        return true;
    };

    ParseUri.parseParams = function (src, target) {
        var array = ParseUri.parseDir(src);
        var retHash = {};
        jQuery.each(target.targetPos, function (i, item) {
            retHash[target.targetKeys[i]] = array[item];
        });
        return retHash;
    };

    ParseUri.matchParseItem = function (src, targets) {
        function subParseParams(counter, src, targets) {
            if (counter >= targets.length)
                return null;
else if (ParseUri.isMatchParams(src, targets[counter])) {
                return targets[counter];
            }
            return subParseParams(counter + 1, src, targets);
        }

        return subParseParams(0, src, targets);
    };

    ParseUri.parseUrl = function (url) {
        function parseItem(counter, itemArray) {
            if (itemArray.length == 0 || counter >= itemArray.length)
                return {};

            var params = itemArray[counter].split("=");
            var hash = {};
            if (params.length == 2)
                hash[params[0]] = params[1];
            return jQuery.extend(hash, parseItem(counter + 1, itemArray));
        }

        var params = url.split("?");
        var paramArray = params[1].split("&");
        return parseItem(0, paramArray);
    };
    return ParseUri;
})();

var ParseTargetItem = (function () {
    function ParseTargetItem(srcParams, targetKeys, targetPos) {
        this.srcParams = srcParams;
        this.targetKeys = targetKeys;
        this.targetPos = targetPos;
    }
    ParseTargetItem.prototype.method = function () {
        return this.srcParams[this.srcParams.length - 1];
    };
    return ParseTargetItem;
})();
//# sourceMappingURL=parse_uri.js.map
