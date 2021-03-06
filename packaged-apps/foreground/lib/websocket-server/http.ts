///<reference path="./sha1.d.ts"/>

declare var chrome;

module http{
    var _responseMap: {[key: string]: string;};
    initialize();

    function initialize(): void{
// Http response code strings.
        _responseMap = {
            200: 'OK',
            301: 'Moved Permanently',
            304: 'Not Modified',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            413: 'Request Entity Too Large',
            414: 'Request-URI Too Long',
            500: 'Internal Server Error'
        };
    }

    function arrayBufferToString(buffer: Array<number>): string{
        var array: Uint8Array = new Uint8Array(buffer);
        var str: string = '';
        for (var i = 0; i < array.length; ++i) {
            str += String.fromCharCode(array[i]);
        }
        return str;
    }

    function stringToArrayBuffer(srcString: string): ArrayBuffer{
        var buffer: ArrayBuffer = new ArrayBuffer(srcString.length);
        var bufferView: Uint8Array = new Uint8Array(buffer);
        for (var i = 0; i < srcString.length; i++) {
            bufferView[i] = srcString.charCodeAt(i);
        }
        return buffer;
    }

    export class EventSource{
        private _listeners: {[key: string]: Array<(any)=>void> };

        constructor(){
            this._listeners = {};
        }

        public on(type: string, callback: (any)=>void ): void{
            if (!this._listeners[type])
                this._listeners[type] = [];
            this._listeners[type].push(callback);
        }

        private _removeEventListener(type: string, callback: ()=>void ): void{
            if (!this._listeners[type])
                return;
            for (var i = this._listeners[type].length - 1; i >= 0; i--) {
                if (this._listeners[type][i] == callback) {
                    this._listeners[type].splice(i, 1);
                }
            }
        }

        public dispatchEvent(type: string, ...var_args: any[]): boolean{
            if (!this._listeners[type])
                return false;
            for (var i = 0; i < this._listeners[type].length; i++) {
                if (this._listeners[type][i].apply(
                    null,
                    var_args)) {
                    return true;
                }
            }
            return false;
        }
    }

    export class HttpServer extends EventSource{
        private _readyState: number;
        private _socketInfo: {[key: string]: number};

        constructor(){
            super();
            this._readyState = 0;
        }

        public listen(port: number, ...opt_host: string[]): void{
            chrome.socket.create('tcp', {}, (socketInfo)=> {
                this._socketInfo = socketInfo;
                var address: string = '0.0.0.0';
                if(opt_host.length > 0) address = opt_host[0];
                chrome.runtime.getBackgroundPage((bgPage)=> {
                    if(bgPage.oldSocketId !== undefined){
                        chrome.socket.disconnect(bgPage.oldSocketId);
                        chrome.socket.destroy(bgPage.oldSocketId);
                    }
                    chrome.socket.listen(this._socketInfo['socketId'], address, port, 50, (result)=> {
                        this._readyState = 1;
                        this._acceptConnection(this._socketInfo['socketId']);
                        bgPage.oldSocketId = this._socketInfo['socketId'];
                    });
                });

            });
        }

        private _acceptConnection(socketId: number): void{
            chrome.socket.accept(this._socketInfo['socketId'], (acceptInfo)=> {
                this._onConnection(acceptInfo);
                this._acceptConnection(socketId);
            });
        }

        private _onConnection(acceptInfo: {[key:string]: number}): void{
            this._readRequestFromSocket(acceptInfo['socketId']);
        }

        private _readRequestFromSocket(socketId: number): void{
            var requestData: string = '';
            var endIndex: number = 0;
            var onDataRead = (readInfo)=> {
                // Check if connection closed.
                if (readInfo.resultCode <= 0) {
                    chrome.socket.disconnect(socketId);
                    chrome.socket.destroy(socketId);
                    return;
                }
                requestData += arrayBufferToString(readInfo.data).replace(/\r\n/g, '\n');
                // Check for end of request.
                endIndex = requestData.indexOf('\n\n', endIndex);
                if (endIndex == -1) {
                    endIndex = requestData.length - 1;
                    chrome.socket.read(socketId, onDataRead);
                    return;
                }

                var headers: string[] = requestData.substring(0, endIndex).split('\n');
                var headerMap: {[key: string]: string} = {};
                // headers[0] should be the Request-Line
                var requestLine: string[] = headers[0].split(' ');
                headerMap['method'] = requestLine[0];
                headerMap['url'] = requestLine[1];
                headerMap['Http-Version'] = requestLine[2];
                for (var i = 1; i < headers.length; i++) {
                    requestLine = headers[i].split(':', 2);
                    if (requestLine.length == 2)
                        headerMap[requestLine[0]] = requestLine[1].trim();
                }
                var request: HttpRequest = new HttpRequest(headerMap, socketId);
                chrome.socket.getInfo(socketId, (socketInfo)=> {
                    request.remoteAddress = socketInfo['peerAddress'];
                    this._onRequest(request);
                });
            }
            chrome.socket.read(socketId, onDataRead);
        }

        private _onRequest(request: HttpRequest): void{
            var type: string = request.headers['Upgrade'] ? 'upgrade' : 'request';
            var keepAlive: boolean = request.headers['Connection'] == 'keep-alive';
            if (!this.dispatchEvent(type, request))
                request.close();
            else if (keepAlive)
                this._readRequestFromSocket(request.socketId);
        }

        public socketId(): number{
            return this._socketInfo['socketId'];
        }
    }

    export class HttpRequest extends EventSource{
        public version: string;
        public headers: {[key: string]: string};
        private _responseHeaders: {[key: string]: string};
        public headersSent: boolean;
        public socketId: number;
        private _writes: number;
        public bytesRemaining: number;
        private _finished: boolean;
        public readyState: number;
        public contentType: string = "";
        public remoteAddress: string = "";

        extensionTypes: {[key: string]: string} =
        {
            'css': 'text/css',
            'html': 'text/html',
            'htm': 'text/html',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'js': 'text/javascript',
            'png': 'image/png',
            'svg': 'image/svg+xml',
            'txt': 'text/plain'
        };

        constructor(headers: {[key: string]: string}, socketId: number){
            super();

            this.version = 'HTTP/1.1';
            this.headers = headers;
            this._responseHeaders = {};
            this.headersSent = false;
            this.socketId = socketId;
            this._writes = 0;
            this.bytesRemaining = 0;
            this._finished = false;
            this.readyState = 1;
        }

        public close(): void{
            if (this.headers['Connection'] != 'keep-alive') {
                chrome.socket.disconnect(this.socketId);
                chrome.socket.destroy(this.socketId);
            }
            this.socketId = 0;
            this.readyState = 3;
        }

        public setHeader(key: string, value: string): void{
            this._responseHeaders[key] = value;
        }

        public writeHead(responseCode: number, responseHeaders: any): void{
            for(var key in this._responseHeaders) {
                responseHeaders[key] = this._responseHeaders[key];
            }

            var headerString: string = this.version + ' ' + responseCode + ' ' +
                (_responseMap[responseCode] || 'Unknown');
            this._responseHeaders = responseHeaders;
            if (this.headers['Connection'] == 'keep-alive')
                responseHeaders['Connection'] = 'keep-alive';
            if (!responseHeaders['Content-Length'] && responseHeaders['Connection'] == 'keep-alive')
                responseHeaders['Transfer-Encoding'] = 'chunked';
            for (var i in responseHeaders) {
                headerString += '\r\n' + i + ': ' + responseHeaders[i];
            }
            headerString += '\r\n\r\n';
            this._write(stringToArrayBuffer(headerString));
        }

        public write(data: any): void{
            if (this._responseHeaders['Transfer-Encoding'] == 'chunked') {
                var newline: string = '\r\n';
                var byteLength: number = (data instanceof ArrayBuffer) ? data.byteLength : data.length;
                var chunkLength: string = byteLength.toString(16).toUpperCase() + newline;
                var buffer: ArrayBuffer = new ArrayBuffer(chunkLength.length + byteLength + newline.length);
                var bufferView: Uint8Array = new Uint8Array(buffer);
                for (var i = 0; i < chunkLength.length; i++)
                    bufferView[i] = chunkLength.charCodeAt(i);
                if (data instanceof ArrayBuffer) {
                    bufferView.set(new Uint8Array(data), chunkLength.length);
                } else {
                    for (var i = 0; i < data.length; i++)
                        bufferView[chunkLength.length + i] = data.charCodeAt(i);
                }
                for (var i = 0; i < newline.length; i++)
                    bufferView[chunkLength.length + byteLength + i] = newline.charCodeAt(i);
                data = buffer;
            } else if (!(data instanceof ArrayBuffer)) {
                data = stringToArrayBuffer(data);
            }
            this._write(data);
        }

        public end(opt_data: ArrayBuffer): void{
            if (opt_data)
                this.write(opt_data);
            if (this._responseHeaders['Transfer-Encoding'] == 'chunked')
                this.write('');
            this._finished = true;
            this._checkFinished();
        }

        public serveUrl(url: string): void{
            var t: HttpRequest = this;
            var xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.onloadend = function() {
                var type: string = 'text/plain';
                if (this.getResponseHeader('Content-Type')) {
                    type = this.getResponseHeader('Content-Type');
                } else if (url.indexOf('.') != -1) {
                    var extension: string = url.substr(url.indexOf('.') + 1);
                    type = t.extensionTypes[extension] || type;
                }

                var contentLength: number = this.getResponseHeader('Content-Length');
                if (xhr.status == 200)
                    contentLength = (this.response && this.response.byteLength) || 0;

                var header = {
                    'Content-Type': type,
                    'Content-Length': contentLength
                };
                t.writeHead(this.status, header);
                t.end(this.response);
            };
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.send();
        }

        private _write(array: ArrayBuffer): void{
            this.bytesRemaining += array.byteLength;
            chrome.socket.write(this.socketId, array, (writeInfo)=> {
                if (writeInfo.bytesWritten < 0) {
                    return;
                }
                this.bytesRemaining -= writeInfo.bytesWritten;
                this._checkFinished();
            });
        }

        private _checkFinished(): void{
            if (!this._finished || this.bytesRemaining > 0)
                return;
            this.close();
        }

        public send(message: string): void{
            var header = {};
            header['Content-Type'] = this.contentType;
            header['Content-Length'] = "" + message.length;
            this.writeHead(200, header);
            this.write(message);
        }
    }

    export class WebSocketServer extends EventSource{
        constructor(httpServer: HttpServer){
            super();
            httpServer.on('upgrade', this._upgradeToWebSocket.bind(this));
        }

        private _upgradeToWebSocket(request): boolean{
            if (request.headers['Upgrade'] != 'websocket' ||
                !request.headers['Sec-WebSocket-Key']) {
                return false;
            }

            var socket = new WebSocketRequest(request).accept();
            if (this.dispatchEvent('connection', socket)){
                if (request._socketId)
                    request.reject();
                return true;
            }

            return false;
        }
    }

    class WebSocketRequest extends HttpRequest{
        constructor(httpRequest: HttpRequest){
            super(httpRequest.headers, httpRequest.socketId);
            httpRequest.socketId = 0;
        }

        public accept(): WebSocketServerSocket{
            // Construct WebSocket response key.
            var clientKey: string = this.headers['Sec-WebSocket-Key'];
            var toArray: (string)=>number[] = function(str: string) {
                var a: number[] = [];
                for (var i = 0; i < str.length; i++) {
                    a.push(str.charCodeAt(i));
                }
                return a;
            };

            var toString: (a: number[])=>string = function(a) {
                var str: string = '';
                for (var i = 0; i < a.length; i++) {
                    str += String.fromCharCode(a[i]);
                }
                return str;
            };

            // Magic string used for http connection key hashing:
            // http://en.wikipedia.org/wiki/WebSocket
            var magicStr: string = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

            // clientKey is base64 encoded key.
            clientKey += magicStr;
            var sha1: Sha1 = new Sha1();
            sha1.reset();
            var array: number[] = toArray(clientKey)
            sha1.update(array, array.length);
            var responseKey: string = btoa(toString(sha1.digest()));

            var responseHeader = {
                "Upgrade": 'websocket',
                "Connection": 'Upgrade',
                "Sec-WebSocket-Accept": responseKey
            };
            if (this.headers['Sec-WebSocket-Protocol'])
                responseHeader['Sec-WebSocket-Protocol'] = this.headers['Sec-WebSocket-Protocol'];
            this.writeHead(101, responseHeader);
            var socket: WebSocketServerSocket = new WebSocketServerSocket(this.socketId);
            socket.upgradeReq['socket'] = this;
            socket.upgradeReq['url'] = this.headers['url'];
            // Detach the socket so that we don't use it anymore.
            this.socketId = 0;
            return socket;
        }

        public reject(){
            this.close();
        }
    }

    export class WebSocketServerSocket extends EventSource{
        private _socketId: number;
        public readyState: number;
        public peerjsID: string = "";
        public upgradeReq = {};

        constructor(socketId: number){
            super();
            this._socketId = socketId;
            this._readFromSocket();
        }

        public send(data: string): void{
            this._sendFrame(1, data);
        }

        public close(): void{
            this._sendFrame(8, null);
            this.readyState = 2;
        }

        private _readFromSocket(): void{
            var data: number[] = [];
            var message: string = '';
            var fragmentedOp: number = 0;
            var fragmentedMessage: string = '';

            var onDataRead = (readInfo)=> {
                if (readInfo.resultCode <= 0) {
                    this._close();
                    return;
                }
                if (!readInfo.data.byteLength) {
                    chrome.socket.read(this._socketId, onDataRead);
                    return;
                }

                var a: Uint8Array = new Uint8Array(readInfo.data);
                for (var i = 0; i < a.length; i++)
                    data.push(a[i]);

                while (data.length) {
                    var length_code: number = -1;
                    var data_start: number = 6;
                    var mask: number[];
                    var fin: number = (data[0] & 128) >> 7;
                    var op: number = data[0] & 15;

                    if (data.length > 1)
                        length_code = data[1] & 127;
                    if (length_code > 125) {
                        if ((length_code == 126 && data.length > 7) ||
                            (length_code == 127 && data.length > 14)) {
                            if (length_code == 126) {
                                length_code = data[2] * 256 + data[3];
                                mask = data.slice(4, 8);
                                data_start = 8;
                            } else if (length_code == 127) {
                                length_code = 0;
                                for (var i = 0; i < 8; i++) {
                                    length_code = length_code * 256 + data[2 + i];
                                }
                                mask = data.slice(10, 14);
                                data_start = 14;
                            }
                        } else {
                            length_code = -1; // Insufficient data to compute length
                        }
                    } else {
                        if (data.length > 5)
                            mask = data.slice(2, 6);
                    }

                    if (length_code > -1 && data.length >= data_start + length_code) {
                        var decoded: number[] = data.slice(data_start, data_start + length_code).map(function(byte, index) {
                            return byte ^ mask[index % 4];
                        });
                        data = data.slice(data_start + length_code);
                        if (fin && op > 0) {
                            // Unfragmented message.
                            if (!this._onFrame(op, arrayBufferToString(decoded)))
                                return;
                        } else {
                            // Fragmented message.
                            fragmentedOp = fragmentedOp || op;
                            fragmentedMessage += arrayBufferToString(decoded);
                            if (fin) {
                                if (!this._onFrame(fragmentedOp, fragmentedMessage))
                                    return;
                                fragmentedOp = 0;
                                fragmentedMessage = '';
                            }
                        }
                    } else {
                        break; // Insufficient data, wait for more.
                    }
                }
                chrome.socket.read(this._socketId, onDataRead);
            };
            chrome.socket.read(this._socketId, onDataRead);
        }

        private _onFrame(op: number, data: string): boolean{
            if (op == 1) {
                this.dispatchEvent('message', data);
            } else if (op == 8) {
                // A close message must be confirmed before the http is closed.
                if (this.readyState == 1) {
                    this._sendFrame(8, null);
                } else {
                    this._close();
                    return false;
                }
            }
            return true;
        }

        private _sendFrame(op: number, data: string){
            var WebsocketFrameString: (number, string)=>ArrayBuffer = (op: number, str: string)=> {
                var length: number = str.length;
                if (str.length > 65535)
                    length += 10;
                else if (str.length > 125)
                    length += 4;
                else
                    length += 2;
                var lengthBytes: number = 0;
                var buffer: ArrayBuffer = new ArrayBuffer(length);
                var bv: Uint8Array = new Uint8Array(buffer);
                bv[0] = 128 | (op & 15); // Fin and type text.
                bv[1] = str.length > 65535 ? 127 :
                    (str.length > 125 ? 126 : str.length);
                if (str.length > 65535)
                    lengthBytes = 8;
                else if (str.length > 125)
                    lengthBytes = 2;
                var len: number = str.length;
                for (var i = lengthBytes - 1; i >= 0; i--) {
                    bv[2 + i] = len & 255;
                    len = len >> 8;
                }
                var dataStart: number = lengthBytes + 2;
                for (var i = 0; i < str.length; i++) {
                    bv[dataStart + i] = str.charCodeAt(i);
                }
                return buffer;
            };

            var array: ArrayBuffer = WebsocketFrameString(op, data || '');
            chrome.socket.write(this._socketId, array, (writeInfo: {[key: string]: number})=> {
                if (writeInfo['resultCode'] < 0 ||
                    writeInfo['bytesWritten'] !== array.byteLength) {
                    this._close();
                }
            });
        }

        private _close(): void{
            chrome.socket.disconnect(this._socketId);
            chrome.socket.destroy(this._socketId);
            this.readyState = 3;
            this.dispatchEvent('close');
        }
    }
}
