///<reference path="./http/http.ts"/>
///<reference path="./util.ts"/>
///<reference path="./my_restify.ts"/>
var WebSocketServer = (function () {
    function WebSocketServer(params) {
        this._isServer = false;
        if (Http.HttpServer && Http.WebSocketServer) {
            // Listen for HTTP connections.
            var myRestify = params.server;
            this._webServer = myRestify.webServer();
            this._webSockServer = new Http.WebSocketServer(this._webServer);
            this._isServer = true;

            // A list of connected websockets.
            var connectedSockets = [];
            this._callback = {};
        }
    }
    WebSocketServer.prototype.on = function (method, callback) {
        this._callback[method] = callback;
        if (method == "connection") {
            this._webSockServer.addEventListener('request', this._onRequest);
        }
    };

    WebSocketServer.prototype._onRequest = function (req) {
        console.log('Client connected');
        console.log(req);

        var socket = req.accept();
        var query = Util.parseUrl(req.headers.uri);
        var self = this;

        chrome.socket.getInfo(socket._socketId, function (socketInfo) {
            query['ip'] = socketInfo['peerAddress'];
            self._callback['connection'](socket, query);
        });

        socket.addEventListener('message', this._onMessage);
        socket.addEventListener('close', this._onClose);

        return true;
    };

    WebSocketServer.prototype._onMessage = function (e) {
        console.log(e.data);
        this._callback['message'](e.data);
    };

    WebSocketServer.prototype._onClose = function () {
        this._callback['close']();
    };
    return WebSocketServer;
})();
//# sourceMappingURL=websocketserver.js.map
