///<reference path="./http/http.ts"/>
///<reference path="./jquery.d.ts"/>
var MyRestify = (function () {
    function MyRestify() {
        this._getCallbackHash = {};
        this._postCallbackHash = {};
        if (Http.HttpServer && Http.WebSocketServer) {
            // Listen for HTTP connections.
            this._webServer = new Http.HttpServer();
        }
    }
    MyRestify.prototype._startListening = function () {
        var self = this;

        this._webServer.addEventListener('request', function (req) {
            if (req.headers['method'] = 'GET')
                self._notifyGet(req.headers['url'], req, null, null);
else if (req.headers['method'] = 'POST')
                self._notifyPost(req.headers['url'], req, null, null);

            var text = "hogehoge";
            req.writeHead(200, {
                'Content-Type': "text/plain",
                'Content-Length': text.length
            });
            req.write("hogehoge");

            /*
            var url = req.headers.url;
            if (url == '/')
            url = '/index.html';
            req.serveUrl(url);
            */
            // Serve the pages of this chrome application.
            return true;
        });
    };

    MyRestify.prototype.listen = function (port) {
        this._webServer.listen(port);
        console.log("hogehoge");
        console.log(port);
        this._startListening();
    };

    MyRestify.prototype.get = function (path, callback) {
        this._getCallbackHash[path] = callback;

        function next() {
            this.get(path, callback);
        }
    };

    MyRestify.prototype.post = function (path, callback) {
        this._postCallbackHash[path] = callback;

        function next() {
            this.post(path, callback);
        }
    };

    MyRestify.prototype._notifyGet = function (path, req, res, next) {
        console.log("path");
        console.log(path);
        if (path in this._getCallbackHash) {
            this._getCallbackHash[path](req, res, next);
        }
    };

    MyRestify.prototype._notifyPost = function (path, req, res, next) {
    };

    MyRestify.prototype.webServer = function () {
        return this._webServer;
    };
    return MyRestify;
})();
//# sourceMappingURL=my_restify.js.map
