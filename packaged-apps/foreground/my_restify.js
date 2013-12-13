///<reference path="./http/http.ts"/>
///<reference path="./jquery.d.ts"/>
///<reference path="./parse_uri.ts"/>
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
    MyRestify.prototype._startListening = function () {
        var self = this;
        console.log("startListening");

        this._webServer.addEventListener('request', function (req) {
            console.log("onrequest");
            if (req.headers['method'] = 'GET')
                self._notifyGet(req.headers['url'], req);
else if (req.headers['method'] = 'POST')
                self._notifyPost(req.headers['url'], req);
            return true;
        });
    };

    MyRestify.prototype.use = function (method) {
        this._chain.push(method);
    };

    MyRestify.prototype.listen = function (port) {
        this._webServer.listen(port);
        this._startListening();
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
        console.log(req);
        var self = this;
        var item = ParseUri.matchParseItem(path, this._getTargetsArray);
        if (item !== null && item.srcPath in this._getCallbackHash) {
            console.log("hit");
            function _applyChain(counter, req, res, callback) {
                console.log("apply chain" + counter);
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
                console.log(self._getCallbackHash);
                console.log(item.srcPath);
                self._getCallbackHash[item.srcPath](req, res, next);
                console.log(req);
            });
        } else {
            console.log("not hit");
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
            console.log("parseBody");
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
            console.log("parsequery");
            var item = ParseUri.matchParseItem(res.headers['url'], self._getTargetsArray);
            req.params = ParseUri.parseParams(res.headers['url'], item);
            req.params.remoteAddress = req.remoteAddress;
            next();
        };
    };
    return MyRestify;
})();
//# sourceMappingURL=my_restify.js.map
