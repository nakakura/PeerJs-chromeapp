///<reference path="./http/http.ts"/>
///<reference path="./jquery.d.ts"/>
///<reference path="./parse_uri.ts"/>

class MyRestify{
    private _webServer: Http.HttpServer;
    private _getTargetsArray: ParseTargetItem[] = [];
    private _postTargetsArray: ParseTargetItem[] = [];
    private _getCallbackHash: {[key: string]: (req: any, res: any, next: ()=>void)=>void} = {};
    private _postCallbackHash: {[key: string]: (req: any, res: any, next: ()=>void)=>void} = {};
    private _chain: Array<(req: any, res: Http.HttpRequest, next: ()=>void)=>void> = [];

    constructor(){
        if (Http.HttpServer && Http.WebSocketServer) {
            // Listen for HTTP connections.
            this._webServer = new Http.HttpServer();
        }
    }

    private _startListening(){
        var self = this;
        console.log("startListening");

        this._webServer.addEventListener('request', function(req: Http.HttpRequest) {
            console.log("onrequest");
            if(req.headers['method'] = 'GET') self._notifyGet(req.headers['url'], req);
            else if(req.headers['method'] = 'POST') self._notifyPost(req.headers['url'], req);
            return true;
        });
    }

    public use(method: (req: any, res: Http.HttpRequest, next: ()=>void)=>void){
        this._chain.push(method);
    }

    public listen(port: number){
        this._webServer.listen(port);
        this._startListening();
    }

    public get(path: string, callback: (req: Http.HttpRequest, res: any, next: ()=>void)=>void){
        this._getTargetsArray.push(ParseUri.targetParams(path));
        this._getCallbackHash[path] = callback;
    }

    public post(path: string, callback: (req: Http.HttpRequest, res: any, next: ()=>void)=>void){
        this._postTargetsArray.push(ParseUri.targetParams(path));
        this._postCallbackHash[path] = callback;
    }

    private _notifyGet(path: string, req: Http.HttpRequest){
        console.log(req);
        var self = this;
        var item = ParseUri.matchParseItem(path, this._getTargetsArray);
        if(item !== null && item.srcPath in this._getCallbackHash){
            console.log("hit");
            function _applyChain(counter: number, req: any, res: Http.HttpRequest,
                callback: (req:any, res: Http.HttpRequest, next: ()=>void)=>void): void{
                console.log("apply chain" + counter);
                if(counter >= self._chain.length){
                    callback(req, res, function(){});
                    return;
                }

                self._chain[counter](req, res, function(){
                    _applyChain(counter + 1, req, res, callback);
                });
            }

            var options = {};
            options['method'] = req.headers['method'];
            _applyChain(0, options, req, function(req: any, res: Http.HttpRequest, next: ()=>void){
                console.log(self._getCallbackHash);
                console.log(item.srcPath);
                self._getCallbackHash[item.srcPath](req, res, next);
                console.log(req);
            });
        }else{
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
  }

    private _notifyPost(path: string, req: Http.HttpRequest){
        var self = this;
        var item = ParseUri.matchParseItem(path, this._postTargetsArray);
        if(item !== null && item.srcPath in this._postCallbackHash){
            function _applyChain(counter: number, req: any, res: Http.HttpRequest,
                                 callback: (req:any, res: Http.HttpRequest, next: ()=>void)=>void): void{
                if(counter >= this._chain.length){
                    callback(req, res, function(){});
                    return;
                }

                this._chain[counter](req, res, function(){
                    _applyChain(counter + 1, req, res, callback);
                });
            }
        }else{
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
    }

    public webServer(): Http.HttpServer{
        return this._webServer;
    }

    public bodyParser(options: any): (req: any, res: Http.HttpRequest, next: ()=>void)=>void{
        options = options || {};
        options.bodyReader = true;

        return function parseBody(req: any, res: Http.HttpRequest, next: ()=>void): void{
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
        }
    }

    public queryParser(): (req: any, res: Http.HttpRequest, next: ()=>void)=>void{
        var self = this;
        return function parseQueryString(req: any, res: Http.HttpRequest, next: ()=>void): void{
            console.log("parsequery");
            var item = ParseUri.matchParseItem(res.headers['url'], self._getTargetsArray);
            req.params = ParseUri.parseParams(res.headers['url'], item);
            req.params.remoteAddress = req.remoteAddress;
            next();
        }
    }
}

