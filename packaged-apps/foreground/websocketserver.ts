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
        console.log("on");
        console.log(method);
        this._callback[method] = callback;
        console.log(this._callback);
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
        });

        console.log("addevent");
        socket.addEventListener('message', this._onMessage.bind(this));
        socket.addEventListener('close', this._onClose.bind(this));

        return true;
    }

    private _onMessage(e: any){
        console.log("onmessage");
        console.log(e.data);
        this._callback['message'](e.data);
    }

    private _onClose(){
        console.log("close");
        console.log(this);
        console.log(this._callback);
        this._callback['close']();
    }
}
