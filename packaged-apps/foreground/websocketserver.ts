///<reference path="./http/http.ts"/>
///<reference path="./util.ts"/>
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
            this._webSockServer.addEventListener('request', this._onRequest);
        }
    }

    private _onRequest(req: any){
        console.log('Client connected');
        console.log(req);

        var socket = req.accept();
        var query = Util.parseUrl(req.headers.uri);
        var self = this;

        chrome.socket.getInfo(socket._socketId, function(socketInfo){
            query['ip'] = socketInfo['peerAddress'];
            self._callback['connection'](socket, query);
        });

        socket.addEventListener('message', this._onMessage);
        socket.addEventListener('close', this._onClose);

        return true;
    }

    private _onMessage(e: any){
        console.log(e.data);
        this._callback['message'](e.data);
    }

    private _onClose(){
        this._callback['close']();
    }
}
