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

        this._webServer.addEventListener('request', function (req) {
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
        var self = this;
        function next_get(path, callback) {
            return function () {
                self.get(path, callback);
                self._getTargetsArray.push(ParseUri.targetParams(path));
            };
        }

        var item = ParseUri.matchParseItem(path, this._getTargetsArray);
        if (item !== null && item.srcPath in this._getCallbackHash) {
            var params = {};
            params['params'] = ParseUri.parseParams(path, item);
            params['params'].remoteAddress = req.remoteAddress;
            var callback = this._getCallbackHash[item.srcPath];
            for (var i = 0; i < this._getTargetsArray.length; i++) {
                if (this._getTargetsArray[i] === item) {
                    this._getTargetsArray.splice(i, 1);
                    break;
                }
            }
            delete this._getCallbackHash[item.srcPath];

            callback(params, req, next_get(item.srcPath, callback));
        } else {
            var text = "hogehoge";
            req.writeHead(200, {
                'Content-Type': "text/plain",
                'Content-Length': text.length,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            req.write("hogehoge");
        }
    };

    MyRestify.prototype._notifyPost = function (path, req) {
        var self = this;
        function next_post(path, callback) {
            return function () {
                self.get(path, callback);
                self._postTargetsArray.push(ParseUri.targetParams(path));
            };
        }

        var item = ParseUri.matchParseItem(path, this._postTargetsArray);
        if (item !== null && item.srcPath in this._postCallbackHash) {
            var params = {};
            params['params'] = ParseUri.parseParams(path, item);
            var callback = this._postCallbackHash[item.srcPath];
            for (var i = 0; i < this._postTargetsArray.length; i++) {
                if (this._postTargetsArray[i] === item) {
                    this._postTargetsArray.splice(i, 1);
                    break;
                }
            }
            delete this._postCallbackHash[item.srcPath];

            callback(params, req, next_post(item.srcPath, callback));
        } else {
            var text = "hogehoge";
            req.writeHead(200, {
                'Content-Type': "text/plain",
                'Content-Length': text.length,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            req.write("hogehoge");
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
        return function parseQueryString(req, res, next) {
            var item = ParseUri.matchParseItem(res.headers['url'], this._getTargetsArray);
            req.params = ParseUri.parseParams(res.headers['url'], item);
            req.params.remoteAddress = req.remoteAddress;
            next();
        };
    };
    return MyRestify;
})();
//# sourceMappingURL=my_restify.js.map
