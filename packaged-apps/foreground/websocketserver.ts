///<reference path="./http/http.ts"/>
///<reference path="./parse_uri.ts"/>
///<reference path="./my_restify.ts"/>

class WebSocketServer{
    private _webServer: Http.HttpServer;
    private _webSockServer: Http.WebSocketServer;
    private _isServer: boolean = false;
    private _callback: {[key: string]: (...item: any[])=>void};

    constructor(params: any){
        if (Http.HttpServer && Http.WebSocketServer) {
            // Listen for HTTP connections.
            var myRestify: MyRestify = params.server;
            this._webServer = myRestify.webServer();
            this._webSockServer = new Http.WebSocketServer(this._webServer);
            this._isServer = true;

            // A list of connected websockets.
            var connectedSockets = [];
            this._callback = {};
        }
    }

    public on(method: string, callback: (...item: any[])=>void){
        this._callback[method] = callback;
        if(method == "connection") {
            this._webSockServer.addEventListener('request', this._onRequest.bind(this));
        }
    }

    private _onRequest(req: any){
        var socket = req.accept();
        var query = ParseUri.parseUrl(req.headers.url);
        var self = this;

        chrome.socket.getInfo(socket._socketId, function(socketInfo){
            query['ip'] = socketInfo['peerAddress'];
            self._callback['connection'](socket, query);

            socket.addEventListener('message', self._onMessage(self, socket));
            socket.addEventListener('close', self._onClose(self, socket));
        });

        return true;
    }

    private _onMessage(self: WebSocketServer, socket: Http.WebSocketServerSocket){
        var peerJsID = socket.peerjsID;
        return function(e){
            self._callback['message'](peerJsID, e.data);
        }
    }

    private _onClose(self: WebSocketServer, socket: Http.WebSocketServerSocket){
        var peerJsID = socket.peerjsID;
        return function(){
            self._callback['close'](peerJsID);
        }
    }
}
