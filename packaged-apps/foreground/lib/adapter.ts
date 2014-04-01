///<reference path="./websocket-server/http.d.ts"/>
///<reference path="./jquery/jquery.d.ts"/>
///<reference path="../application/URIMatcher.ts"/>

module restify{
    var myRestify: MyRestify = null;

    export function createServer(params: any): MyRestify{
        if(myRestify == null) myRestify = new MyRestify();
        return myRestify;
    }

    export function bodyParser(options: any): (req: any, res: any, next: ()=>void)=>void{
        return myRestify.bodyParser(options);
    }

    export function queryParser(): (req: any, res: any, next: ()=>void)=>void{
        return myRestify.queryParser();
    }
}

class MyRestify{
    private _webServer: http.Server;
    private _matcherArray: App.URIMatcher[] = [];
    private _getCallbackHash: {[key: string]: (req: any, res: any, next: ()=>void)=>void} = {};
    private _postCallbackHash: {[key: string]: (req: any, res: any, next: ()=>void)=>void} = {};
    private _chain: Array<(req: any, res: any, next: ()=>void)=>void> = [];

    constructor(){
        if (http.Server && http.WebSocketServer) {
            // Listen for HTTP connections.
            this._webServer = new http.Server();
        }
    }
    public use(method: (req: any, res: any, next: ()=>void)=>void){
        this._chain.push(method);
    }

    public listen(port: number){
        this._webServer.listen(port);
        this._startListening();
    }

    private _startListening(){
        var self = this;

        this._webServer.addEventListener('request', function(req: any) {
            console.log(req.headers['url']);
            if(req.headers['method'] = 'GET') self._notifyGet(req.headers['url'], req);
            else if(req.headers['method'] = 'POST') self._notifyPost(req.headers['url'], req);
            return true;
        });
    }

    public get(path: string, callback: (req: any, res: any, next: ()=>void)=>void){
        console.log("set get " + path);
        var uriParser = new App.URIMatcher(path);
        this._matcherArray.push(uriParser);
        this._getCallbackHash[path] = callback;
    }

    public post(path: string, callback: (req: any, res: any, next: ()=>void)=>void){
        var uriParser = new App.URIMatcher(path);
        this._matcherArray.push(uriParser);
        this._postCallbackHash[path] = callback;
    }

    private _notifyGet(path: string, req: any){
        console.log("notify get " + path);
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
                    res.finished_ = true;
                    console.log(res.headers);
                    res.headers['Connection'] = "closing";
                    //res.checkFinished_();
                });
                return;
            }

            this._chain[counter](req, res, ()=>{
                _applyChain(counter + 1, req, res, callback);
            });
        };

        var options = {};
        options['method'] = req.headers['method'];
        _applyChain(0, options, req, (req: any, res: any, next: ()=>void)=>{
            this._getCallbackHash[matcher.sourceURL](req, res, next);
        });
    }

    private _notifyPost(path: string, req: any){
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
                    res.finished_ = true;
                    res.headers['Connection'] = "closing";
                    //res.checkFinished_();
                });
                return;
            }

            this._chain[counter](req, res, ()=>{
                _applyChain(counter + 1, req, res, callback);
            });
        };

        var options = {};
        options['method'] = req.headers['method'];
        _applyChain(0, options, req, (req: any, res: any, next: ()=>void)=>{
            this._postCallbackHash[matcher.sourceURL](req, res, next);
        });
    }

    private _matchIndex(path): number{
        console.log("matchindex");
        var retValue = -1;
        for(var i = 0; i < this._matcherArray.length; i++){
            if(this._matcherArray[i].test(path)){
                retValue = i;
                return retValue;
            }
        }

        return retValue;
    }

    private _send404Message(req: any){
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
    public webServer(): http.Server{
        return this._webServer;
    }

    public bodyParser(options: any): (req: any, res: any, next: ()=>void)=>void{
        options = options || {};
        options.bodyReader = true;

        return function parseBody(req: any, res: any, next: ()=>void): void{
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

    public queryParser(): (req: any, res: any, next: ()=>void)=>void{
        return (req: any, res: any, next: ()=>void)=>{
            console.log(res.headers['url']);
            var paths = res.headers['url'].split("?");
            console.log(paths);
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

class WebSocketServer extends http.WebSocketServer{
    constructor(params: any){
        var myRestify: MyRestify = params.server;
        super(myRestify.webServer());
    }

    public on(method: string, callback:(any)=>void){
        this.addEventListener(method, callback);
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
