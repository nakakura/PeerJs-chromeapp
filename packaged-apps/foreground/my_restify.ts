///<reference path="./http/http.ts"/>
///<reference path="./jquery.d.ts"/>
///<reference path="./util.ts"/>

class MyRestify{
    private _webServer: Http.HttpServer;
    private _getTargetsArray: ParseTargetItem[] = [];
    private _postTargetsArray: ParseTargetItem[] = [];
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
            console.log("request-=--------");
            console.log(req);
            if(req.headers['method'] = 'GET') self._notifyGet(req.headers['url'], req, null);
            else if(req.headers['method'] = 'POST') self._notifyPost(req.headers['url'], req, null, null);



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
        console.log("get");
        console.log(path);
        this._getTargetsArray.push(ParseUri.targetParams(path));
        this._getCallbackHash[path] = callback;
    }

    public post(path: string, callback: (req: Http.HttpRequest, res: any, next: ()=>void)=>void){
        console.log("post");
        console.log(path);
        this._postTargetsArray.push(ParseUri.targetParams(path));
        this._postCallbackHash[path] = callback;
    }

    private _notifyGet(path: string, req: any, res: any){
        var self = this;
        function next_get(path, callback){
            return function(){
                console.log("next");
                console.log(path);
                self.get(path, callback);
                self._getTargetsArray.push(ParseUri.targetParams(path));
            }
        }

        var item = ParseUri.matchParseItem(path, this._getTargetsArray);
        if(item !== null && item.srcPath in this._getCallbackHash){
            var params = {};
            params['params'] = ParseUri.parseParams(path, item);
            params['params'].remoteAddress = req.remoteAddress;
            var callback = this._getCallbackHash[item.srcPath];
            for(var i = 0; i < this._getTargetsArray.length; i++){
                if(this._getTargetsArray[i] === item) {
                    this._getTargetsArray.splice(i, 1);
                    break;
                }
            }
            delete this._getCallbackHash[item.srcPath];

            callback(params, req, next_get(item.srcPath, callback));
        }else{
            var text = "hogehoge";
            req.writeHead(200, {
                'Content-Type': "text/plain",
                'Content-Length': text.length,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            req.write("hogehoge");
        }
  }

    private _notifyPost(path: string, req: any, res: any, next: ()=>void){
        console.log("notifypost======================");
        console.log(path);
        var self = this;
        function next_post(path, callback){
            return function(){
                console.log("next");
                console.log(path);
                self.get(path, callback);
                self._postTargetsArray.push(ParseUri.targetParams(path));
            }
        }

        var item = ParseUri.matchParseItem(path, this._postTargetsArray);
        if(item !== null && item.srcPath in this._postCallbackHash){
            var params = {};
            params['params'] = ParseUri.parseParams(path, item);
            var callback = this._postCallbackHash[item.srcPath];
            for(var i = 0; i < this._postTargetsArray.length; i++){
                if(this._postTargetsArray[i] === item) {
                    this._postTargetsArray.splice(i, 1);
                    break;
                }
            }
            delete this._postCallbackHash[item.srcPath];

            callback(params, req, next_post(item.srcPath, callback));
        }else{
            var text = "hogehoge";
            req.writeHead(200, {
                'Content-Type': "text/plain",
                'Content-Length': text.length,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            req.write("hogehoge");
        }
    }

    public webServer(): Http.HttpServer{
        return this._webServer;
    }
}

