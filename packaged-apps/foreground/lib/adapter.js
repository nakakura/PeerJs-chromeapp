///<reference path="./websocket-server/http.ts"/>
///<reference path="./jquery/jquery.d.ts"/>
///<reference path="../application/URIMatcher.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var restify;
(function (restify) {
    var myRestify = null;

    function createServer(params) {
        if (myRestify == null)
            myRestify = new MyRestify();
        return myRestify;
    }
    restify.createServer = createServer;

    function bodyParser(options) {
        return myRestify.bodyParser(options);
    }
    restify.bodyParser = bodyParser;

    function queryParser() {
        return myRestify.queryParser();
    }
    restify.queryParser = queryParser;
})(restify || (restify = {}));

var MyRestify = (function () {
    function MyRestify() {
        this._matcherArray = [];
        this._getCallbackHash = {};
        this._postCallbackHash = {};
        this._chain = [];
        if (Http.HttpServer && Http.WebSocketServer) {
            // Listen for HTTP connections.
            this._webServer = new Http.HttpServer();
        }
    }
    MyRestify.prototype.use = function (method) {
        this._chain.push(method);
    };

    MyRestify.prototype.listen = function (port) {
        this._webServer.listen(port);
        this._startListening();
    };

    MyRestify.prototype._startListening = function () {
        var self = this;

        this._webServer.on('request', function (req) {
            console.log(req.headers['url']);
            var url = req.headers['url'].split("?")[0];
            if (req.headers['method'] = 'GET')
                self._notifyGet(url, req);
            else if (req.headers['method'] = 'POST')
                self._notifyPost(url, req);
            return true;
        });
    };

    MyRestify.prototype.get = function (path, callback) {
        console.log("set get " + path);
        var uriParser = new App.URIMatcher(path);
        this._matcherArray.push(uriParser);
        this._getCallbackHash[path] = callback;
    };

    MyRestify.prototype.post = function (path, callback) {
        var uriParser = new App.URIMatcher(path);
        this._matcherArray.push(uriParser);
        this._postCallbackHash[path] = callback;
    };

    MyRestify.prototype._notifyGet = function (path, req) {
        var _this = this;
        console.log("notify get " + path);
        console.log(req);
        var matchID = this._matchIndex(path);
        if (matchID == -1) {
            this._send404Message(req);
            return;
        }
        var matcher = this._matcherArray[matchID];
        var _applyChain = function (counter, req, res, callback) {
            if (counter >= _this._chain.length) {
                callback(req, res, function () {
                    //res.checkFinished_();
                });
                return;
            }

            _this._chain[counter](req, res, function () {
                _applyChain(counter + 1, req, res, callback);
            });
        };

        var options = {};
        options['method'] = req.headers['method'];
        options.connection = {};
        options.connection.remoteAddress = req.remoteAddress;
        console.log("notifyget-------");
        console.log(req.remoteAddress);
        _applyChain(0, options, req, function (req, res, next) {
            _this._getCallbackHash[matcher.sourceURL](req, res, next);
        });
    };

    MyRestify.prototype._notifyPost = function (path, req) {
        var _this = this;
        var matchID = this._matchIndex(path);
        if (matchID == -1) {
            this._send404Message(req);
            return;
        }
        var matcher = this._matcherArray[matchID];
        var _applyChain = function (counter, req, res, callback) {
            if (counter >= _this._chain.length) {
                callback(req, res, function () {
                    //res.checkFinished_();
                });
                return;
            }

            _this._chain[counter](req, res, function () {
                _applyChain(counter + 1, req, res, callback);
            });
        };

        var options = {};
        options['method'] = req.headers['method'];
        options.connection = {};
        options.connection.remoteAddress = req.remoteAddress;
        _applyChain(0, options, req, function (req, res, next) {
            _this._postCallbackHash[matcher.sourceURL](req, res, next);
        });
    };

    MyRestify.prototype._matchIndex = function (path) {
        console.log("matchindex");
        console.log(path);
        var retValue = -1;
        for (var i = 0; i < this._matcherArray.length; i++) {
            if (this._matcherArray[i].test(path)) {
                retValue = i;
                console.log("matchindex " + i);
                return retValue;
            }
        }

        return retValue;
    };

    MyRestify.prototype._send404Message = function (req) {
        console.log("404=============");
        var errorMessage = "404 Not Found";
        req.writeHead(200, {
            'Content-Type': "text/plain",
            'Content-Length': errorMessage.length,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        req.write(errorMessage);
        req.finished_ = true;
        req.headers['Connection'] = "closing";
        req.checkFinished_();
    };

    MyRestify.prototype.webServer = function () {
        return this._webServer;
    };

    MyRestify.prototype.bodyParser = function (options) {
        options = options || {};
        options.bodyReader = true;

        return function parseBody(req, res, next) {
            if (req.method == 'HEAD') {
                next();
                return;
            }
            if (req.method == 'GET') {
                if (options.requestBodyOnGet == null || options.requestBodyOnGet == false) {
                    next();
                    return;
                }
            }

            next();
        };
    };

    MyRestify.prototype.queryParser = function () {
        var _this = this;
        return function (req, res, next) {
            console.log(res.headers['url']);
            var paths = res.headers['url'].split("?");
            console.log(paths[1]);
            var matchID = _this._matchIndex(paths[0]);
            var matcher = _this._matcherArray[matchID];
            console.log(matchID);
            req.params = {};
            console.log("queryparser");
            matcher.match(res.headers['url'], req.params);
            next();
        };
    };
    return MyRestify;
})();

var WebSocketServer = (function (_super) {
    __extends(WebSocketServer, _super);
    function WebSocketServer(params) {
        var myRestify = params.server;
        _super.call(this, myRestify.webServer());
    }
    return WebSocketServer;
})(Http.WebSocketServer);

var url = (function () {
    function url() {
    }
    url.parse = function (urlString, flag) {
        console.log(urlString);
        var params = url.parseUrl(urlString);
        console.log(params);
        return { url: urlString, query: params };
    };

    url.parseUrl = function (url) {
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
    return url;
})();
//# sourceMappingURL=adapter.js.map
