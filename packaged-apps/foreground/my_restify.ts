///<reference path="./http/http.ts"/>
///<reference path="./jquery.d.ts"/>

class MyRestify{
    private _webServer: Http.HttpServer;
    private _getCallbackHash: {[key: string]: (req: any, res: any, next: ()=>void)=>void} = {};
    private _postCallbackHash: {[key: string]: (req: any, res: any, next: ()=>void)=>void} = {};

    constructor(){
        if (Http.HttpServer && Http.WebSocketServer) {
            // Listen for HTTP connections.
            this._webServer = new Http.HttpServer();
        }
    }

    private _startListening(){
        var self = this;

        this._webServer.addEventListener('request', function(req: Http.HttpRequest) {
            if(req.headers['method'] = 'GET') self._notifyGet(req.headers['url'], req, null, null);
            else if(req.headers['method'] = 'POST') self._notifyPost(req.headers['url'], req, null, null);

            var text = "hogehoge";
            req.writeHead(200, {
                'Content-Type': "text/plain",
                'Content-Length': text.length});
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
    }

    public listen(port: number){
        this._webServer.listen(port);
        console.log("hogehoge");
        console.log(port);
        this._startListening();
    }

    public get(path: string, callback: (req: Http.HttpRequest, res: any, next: ()=>void)=>void){
        this._getCallbackHash[path] = callback;

        function next(){
            this.get(path, callback);

        }
    }

    public post(path: string, callback: (req: any, res: any, next: ()=>void)=>void){
        this._postCallbackHash[path] = callback;

        function next(){
            this.post(path, callback);
        }
    }

    private _notifyGet(path: string, req: any, res: any, next: ()=>void){
        console.log("path");
        console.log(path);
       if(path in this._getCallbackHash){
            this._getCallbackHash[path](req, res, next);
        }
    }

    private _notifyPost(path: string, req: any, res: any, next: ()=>void){

    }

    public webServer(): Http.HttpServer{
        return this._webServer;
    }
}

