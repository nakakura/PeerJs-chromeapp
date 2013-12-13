///<reference path="./http.ts"/>
///<reference path="./../jquery.d.ts"/>
///<reference path="./parse_uri.ts"/>

module restify{
    var myRestify: MyRestify = null;

    export function createServer(params: any): MyRestify{
        if(myRestify == null) myRestify = new MyRestify();
        return myRestify;
    }

    export function bodyParser(options: any): (req: any, res: Http.HttpRequest, next: ()=>void)=>void{
        return myRestify.bodyParser(options);
    }

    export function queryParser(): (req: any, res: Http.HttpRequest, next: ()=>void)=>void{
        return myRestify.queryParser();
    }
}

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
    public use(method: (req: any, res: Http.HttpRequest, next: ()=>void)=>void){
        this._chain.push(method);
    }

    public listen(port: number){
        this._webServer.listen(port);
        this._startListening();
    }

    private _startListening(){
        var self = this;

        this._webServer.on('request', function(req: Http.HttpRequest) {
            if(req.headers['method'] = 'GET') self._notifyGet(req.headers['url'], req);
            else if(req.headers['method'] = 'POST') self._notifyPost(req.headers['url'], req);
            return true;
        });
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
        var self = this;
        var item = ParseUri.matchParseItem(path, this._getTargetsArray);
        if(item !== null && item.srcPath in this._getCallbackHash){
            function _applyChain(counter: number, req: any, res: Http.HttpRequest,
                callback: (req:any, res: Http.HttpRequest, next: ()=>void)=>void): void{
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
                self._getCallbackHash[item.srcPath](req, res, next);
            });
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
            var options = {};
            options['method'] = req.headers['method'];
            _applyChain(0, options, req, function(req: any, res: Http.HttpRequest, next: ()=>void){
                self._postCallbackHash[item.srcPath](req, res, next);
            });
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
            var item = ParseUri.matchParseItem(res.headers['url'], self._getTargetsArray);
            req.params = ParseUri.parseParams(res.headers['url'], item);
            var connection = {remoteAddress: res.remoteAddress};
            req['connection'] = connection;
            next();
        }
    }
}

class WebSocketServer extends Http.WebSocketServer{
    constructor(params: any){
        var myRestify: MyRestify = params.server;
        super(myRestify.webServer());
    }
}

class url{
    static parse(urlString: string, flag: boolean): any{
        var params = ParseUri.parseUrl(urlString);
        return {url: urlString, query: params};
    }
}
