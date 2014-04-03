/**
* Created by nakakura on 4/1/14.
*/
///<reference path="../lib/jquery/jquery.d.ts"/>
var App;
(function (App) {
    var URIMatcher = (function () {
        function URIMatcher(matcherString) {
            this._matchedParams = [];
            this._matcher = null;
            this._urlPart = "([\\w:%#\\$&\\?\\(\\)~\\.=\\+\\-]+)";
            this.sourceURL = '';
            this.sourceURL = matcherString;
            this._createMatcher(matcherString);
        }
        URIMatcher.prototype._createMatcher = function (matcherString) {
            var _this = this;
            var regExpString = "^";
            var matcherItems = this._parseDir(matcherString);

            matcherItems.forEach(function (item) {
                if (item.indexOf(":") == 0) {
                    _this._matchedParams.push(item.substring(1));
                    regExpString += "/" + _this._urlPart;
                } else {
                    regExpString += "/" + item;
                }
            });

            regExpString += "$";

            this._matcher = new RegExp(regExpString);
        };

        URIMatcher.prototype._chompNull = function (array) {
            var _removeNull = function (counter, subArray) {
                if (counter >= subArray.length)
                    return subArray;
                else if (subArray[counter] === "") {
                    subArray.splice(counter, 1);
                    return _removeNull(counter, subArray);
                } else {
                    return _removeNull(counter + 1, subArray);
                }
            };

            return _removeNull(0, array);
        };

        URIMatcher.prototype._parseDir = function (path) {
            var array = path.split("/");
            return this._chompNull(array);
        };

        URIMatcher.prototype.test = function (targetURI) {
            return this._matcher.test(targetURI);
        };

        URIMatcher.prototype.match = function (url, retHash) {
            var targetURI = url.split("?")[0];
            if (!this._matcher.test(targetURI))
                return false;
            var matchedItems = this._matcher.exec(targetURI);

            for (var i = 0; i < this._matchedParams.length; i++) {
                retHash[this._matchedParams[i]] = matchedItems[i + 1];
            }

            var items = this._parseDir(targetURI);
            var fileName = items[items.length - 1];

            return true;
        };
        return URIMatcher;
    })();
    App.URIMatcher = URIMatcher;
})(App || (App = {}));
//# sourceMappingURL=URIMatcher.js.map
