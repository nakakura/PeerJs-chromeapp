///<reference path="./websocket-server/http.ts"/>
///<reference path="./jquery/jquery.d.ts"/>
///<reference path="../application/URIMatcher.ts"/>

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
    private _matcherArray: App.URIMatcher[] = [];
    private _getCallbackHash: {[key: string]: (req: any, res: any, next: ()=>void)=>void} = {};
    private _postCallbackHash: {[key: string]: (req: any, res: any, next: ()=>void)=>void} = {};
    private _chain: Array<(req: any, res: any, next: ()=>void)=>void> = [];

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
            console.log(req.headers['url']);
            var url = req.headers['url'].split("?")[0];
            if(req.headers['method'] = 'GET') self._notifyGet(url, req);
            else if(req.headers['method'] = 'POST') self._notifyPost(url, req);
            return true;
        });
    }

    public get(path: string, callback: (req: Http.HttpRequest, res: any, next: ()=>void)=>void){
        console.log("set get " + path);
        var uriParser = new App.URIMatcher(path);
        this._matcherArray.push(uriParser);
        this._getCallbackHash[path] = callback;
    }

    public post(path: string, callback: (req: Http.HttpRequest, res: any, next: ()=>void)=>void){
        var uriParser = new App.URIMatcher(path);
        this._matcherArray.push(uriParser);
        this._postCallbackHash[path] = callback;
    }

    private _notifyGet(path: string, req: Http.HttpRequest){
        console.log("notify get " + path);
        console.log(req);
        var matchID = this._matchIndex(path);
        if(matchID == -1) {
            this._send404Message(req);
            return;
        }
        var matcher = this._matcherArray[matchID];
        var _applyChain = (counter: number, req: any, res: any,
                           callback: (req:any, res: any, next: ()=>void)=>void)=>{
            if(counter >= this._chain.length){
                callback(req, res, ()=>{
                    //res.checkFinished_();
                });
                return;
            }

            this._chain[counter](req, res, ()=>{
                _applyChain(counter + 1, req, res, callback);
            });
        };

        var options: any = {};
        options['method'] = req.headers['method'];
        options.connection = {};
        options.connection.remoteAddress = req.remoteAddress;
        console.log("notifyget-------");
        console.log(req.remoteAddress);
        _applyChain(0, options, req, (req: any, res: any, next: ()=>void)=>{
            this._getCallbackHash[matcher.sourceURL](req, res, next);
        });
    }

    private _notifyPost(path: string, req: Http.HttpRequest){
        var matchID = this._matchIndex(path);
        if(matchID == -1) {
            this._send404Message(req);
            return;
        }
        var matcher = this._matcherArray[matchID];
        var _applyChain = (counter: number, req: any, res: any,
                           callback: (req:any, res: any, next: ()=>void)=>void)=>{
            if(counter >= this._chain.length){
                callback(req, res, ()=>{
                    //res.checkFinished_();
                });
                return;
            }

            this._chain[counter](req, res, ()=>{
                _applyChain(counter + 1, req, res, callback);
            });
        };

        var options: any = {};
        options['method'] = req.headers['method'];
        options.connection = {};
        options.connection.remoteAddress = req.remoteAddress;
        _applyChain(0, options, req, (req: any, res: any, next: ()=>void)=>{
            this._postCallbackHash[matcher.sourceURL](req, res, next);
        });
    }

    private _matchIndex(path): number{
        console.log("matchindex");
        console.log(path);
        var retValue = -1;
        for(var i = 0; i < this._matcherArray.length; i++){
            if(this._matcherArray[i].test(path)){
                retValue = i;
                console.log("matchindex " + i);
                return retValue;
            }
        }

        return retValue;
    }

    private _send404Message(req: any){
        console.log("404=============");
        var errorMessage = "404 Not Found";
        req.writeHead(200, {
            'Content-Type': "text/plain",
            'Content-Length': errorMessage.length,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        req.write(errorMessage);
        req.finished_ = true;
        req.headers['Connection'] = "closing";
        req.checkFinished_();

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
        return (req: any, res: any, next: ()=>void)=>{
            console.log(res.headers['url']);
            var paths = res.headers['url'].split("?");
            console.log(paths[1]);
            var matchID = this._matchIndex(paths[0]);
            var matcher = this._matcherArray[matchID];
            console.log(matchID);
            req.params = {};
            console.log("queryparser");
            matcher.match(res.headers['url'], req.params);
            next();
        };
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
        console.log(urlString);
        var params = url.parseUrl(urlString);
        console.log(params);
        return {url: urlString, query: params};
    }

    static parseUrl(url: string): {[key: string]: string}{
        function parseItem(counter: number, itemArray: string[]): {[key: string]: string}{
            if(itemArray.length == 0 || counter >= itemArray.length) return {};

            var params: string[] = itemArray[counter].split("=");
            var hash: {[key:string]: string} = {};
            if(params.length == 2) hash[params[0]] = params[1];
            return jQuery.extend(hash, parseItem(counter + 1, itemArray));
        }

        var params: string[] = url.split("?");
        var paramArray: string[] = params[1].split("&");
        return parseItem(0, paramArray);
    }
}
