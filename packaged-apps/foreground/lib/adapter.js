///<reference path="./http.ts"/>
///<reference path="./jquery.d.ts"/>
///<reference path="./parse_uri.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MyRestify = (function () {
    function MyRestify() {
        this._getTargetsArray = [];
        this._postTargetsArray = [];
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
            if (req.headers['method'] = 'GET')
                self._notifyGet(req.headers['url'], req);
else if (req.headers['method'] = 'POST')
                self._notifyPost(req.headers['url'], req);
            return true;
        });
    };

    MyRestify.prototype.get = function (path, callback) {
        this._getTargetsArray.push(ParseUri.targetParams(path));
        this._getCallbackHash[path] = callback;
    };

    MyRestify.prototype.post = function (path, callback) {
        this._postTargetsArray.push(ParseUri.targetParams(path));
        this._postCallbackHash[path] = callback;
    };

    MyRestify.prototype._notifyGet = function (path, req) {
        var self = this;
        var item = ParseUri.matchParseItem(path, this._getTargetsArray);
        if (item !== null && item.srcPath in this._getCallbackHash) {
            function _applyChain(counter, req, res, callback) {
                if (counter >= self._chain.length) {
                    callback(req, res, function () {
                    });
                    return;
                }

                self._chain[counter](req, res, function () {
                    _applyChain(counter + 1, req, res, callback);
                });
            }

            var options = {};
            options['method'] = req.headers['method'];
            _applyChain(0, options, req, function (req, res, next) {
                self._getCallbackHash[item.srcPath](req, res, next);
            });
        } else {
            var errorMessage = "404 Not Found";
            req.writeHead(200, {
                'Content-Type': "text/plain",
                'Content-Length': errorMessage.length,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            req.write(errorMessage);
        }
    };

    MyRestify.prototype._notifyPost = function (path, req) {
        var self = this;
        var item = ParseUri.matchParseItem(path, this._postTargetsArray);
        if (item !== null && item.srcPath in this._postCallbackHash) {
            function _applyChain(counter, req, res, callback) {
                if (counter >= this._chain.length) {
                    callback(req, res, function () {
                    });
                    return;
                }

                this._chain[counter](req, res, function () {
                    _applyChain(counter + 1, req, res, callback);
                });
            }
            var options = {};
            options['method'] = req.headers['method'];
            _applyChain(0, options, req, function (req, res, next) {
                self._postCallbackHash[item.srcPath](req, res, next);
            });
        } else {
            var errorMessage = "404 Not Found";
            req.writeHead(200, {
                'Content-Type': "text/plain",
                'Content-Length': errorMessage.length,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            req.write(errorMessage);
        }
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
        var self = this;
        return function parseQueryString(req, res, next) {
            var item = ParseUri.matchParseItem(res.headers['url'], self._getTargetsArray);
            req.params = ParseUri.parseParams(res.headers['url'], item);
            var connection = { remoteAddress: res.remoteAddress };
            req['connection'] = connection;
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
        var params = ParseUri.parseUrl(urlString);
        return { url: urlString, query: params };
    };
    return url;
})();
//# sourceMappingURL=adapter.js.map
