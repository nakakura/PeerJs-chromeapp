///<reference path="./http/http.ts"/>
///<reference path="./parse_uri.ts"/>
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
            this._webSockServer.addEventListener('request', this._onRequest.bind(this));
        }
    };

    WebSocketServer.prototype._onRequest = function (req) {
        var socket = req.accept();
        var query = ParseUri.parseUrl(req.headers.url);
        var self = this;

        chrome.socket.getInfo(socket._socketId, function (socketInfo) {
            query['ip'] = socketInfo['peerAddress'];
            self._callback['connection'](socket, query);

            socket.addEventListener('message', self._onMessage(self, socket));
            socket.addEventListener('close', self._onClose(self, socket));
        });

        return true;
    };

    WebSocketServer.prototype._onMessage = function (self, socket) {
        var peerJsID = socket.peerjsID;
        return function (e) {
            self._callback['message'](peerJsID, e.data);
        };
    };

    WebSocketServer.prototype._onClose = function (self, socket) {
        var peerJsID = socket.peerjsID;
        return function () {
            self._callback['close'](peerJsID);
        };
    };
    return WebSocketServer;
})();
//# sourceMappingURL=websocketserver.js.map
