(function () { "use strict";
var $estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,__class__: EReg
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var Main = function() { }
Main.__name__ = true;
Main.main = function() {
	var ssdpManager = new models.ssdp.SSDPManager(9000);
}
var IMap = function() { }
IMap.__name__ = true;
var Std = function() { }
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.random = function(x) {
	return x <= 0?0:Math.floor(Math.random() * x);
}
var StringTools = function() { }
StringTools.__name__ = true;
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
}
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.rpad = function(s,c,l) {
	if(c.length <= 0) return s;
	while(s.length < l) s = s + c;
	return s;
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
}
var haxe = {}
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.__name__ = true;
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
}
haxe.Timer.prototype = {
	run: function() {
	}
	,stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,__class__: haxe.Timer
}
haxe.ds = {}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: haxe.ds.StringMap
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) {
					if(cl == Array) return o.__enum__ == null;
					return true;
				}
				if(js.Boot.__interfLoop(o.__class__,cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
}
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
}
js.Browser = function() { }
js.Browser.__name__ = true;
var models = {}
models.common = {}
models.common.Util = function() { }
models.common.Util.__name__ = true;
models.common.Util.stringToArrayBuffer = function(message) {
	var buffer = new ArrayBuffer(message.length);
	var view = new DataView(buffer);
	var _g1 = 0, _g = message.length;
	while(_g1 < _g) {
		var i = _g1++;
		view.setInt8(i,HxOverrides.cca(message.charAt(i),0));
	}
	return buffer;
}
models.common.Util.arrayBufferToString = function(arrayBuffer) {
	var array = new Int8Array(arrayBuffer);
	var message = "";
	var _g1 = 0, _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		message += String.fromCharCode(array[i]);
	}
	return message;
}
models.common.Util.uuidCreate = function() {
	var timeF = new Date().getTime();
	var time = timeF - 268435455. * (timeF / 268435455 | 0) | 0;
	var uuid = StringTools.rpad(models.common.Util.getHexClientIP(),"0",8) + "-" + StringTools.hex(timeF / 65536 | 0,8) + "-" + StringTools.hex(time % 65536,8) + "-" + StringTools.hex(Std.random(65536),4) + "-" + StringTools.hex(Std.random(65536),4);
	return uuid;
}
models.common.Util.getHexClientIP = function() {
	var ip = "127.0.0.1";
	var hex = "";
	var _g = 0, _g1 = ip.split(".");
	while(_g < _g1.length) {
		var part = _g1[_g];
		++_g;
		hex += StringTools.hex(Std.parseInt(part),2);
	}
	return hex;
}
models.common.Util.isIpv4 = function(address) {
	var octet = address.split(".");
	if(octet.length != 4) return false;
	var _g = 0;
	while(_g < 4) {
		var i = _g++;
		var val = Std.parseInt(octet[i]);
		if(val < 0 || val > 255) return false;
	}
	return true;
}
models.network = {}
models.network.Http = function() { }
models.network.Http.__name__ = true;
models.network.Http.initialize = function() {
	models.network.Http.statusCode.set("200","OK");
	"OK";
	models.network.Http.statusCode.set("301","Moved Permanently");
	"Moved Permanently";
	models.network.Http.statusCode.set("304","Not Modified");
	"Not Modified";
	models.network.Http.statusCode.set("400","Bad Request");
	"Bad Request";
	models.network.Http.statusCode.set("401","Unauthorized");
	"Unauthorized";
	models.network.Http.statusCode.set("403","Forbidden");
	"Forbidden";
	models.network.Http.statusCode.set("404","Not Found");
	"Not Found";
	models.network.Http.statusCode.set("413","Request Entity Too Large");
	"Request Entity Too Large";
	models.network.Http.statusCode.set("414","Request-URI Too Long");
	"Request-URI Too Long";
	models.network.Http.statusCode.set("500","Internal Server Error");
	"Internal Server Error";
}
models.network.Http.arrayToArrayBuffer = function(array) {
	var buffer = new ArrayBuffer(array.length);
	var bufferView = new Uint8Array(buffer);
	var _g1 = 0, _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		bufferView[i] = array[i];
	}
	return buffer;
}
models.network.Http.arrayBufferToString = function(buffer) {
	var array = new Uint8Array(buffer);
	var str = "";
	var _g1 = 0, _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		str += String.fromCharCode(array[i]);
	}
	return str;
}
models.network.Http.stringToArrayBuffer = function(srcString) {
	var buffer = new ArrayBuffer(srcString.length);
	var bufferView = new Uint8Array(buffer);
	var _g1 = 0, _g = srcString.length;
	while(_g1 < _g) {
		var i = _g1++;
		bufferView[i] = HxOverrides.cca(srcString,i);
	}
	return buffer;
}
models.network.EventObserver = function() { }
models.network.EventObserver.__name__ = true;
models.network.EventObserver.prototype = {
	__class__: models.network.EventObserver
}
models.network.EventSource = function() {
	this._listenersMap = new haxe.ds.StringMap();
};
models.network.EventSource.__name__ = true;
models.network.EventSource.prototype = {
	dispatchEvent: function(type,var_args) {
		if(!this._listenersMap.exists(type)) return false;
		var _g1 = 0, _g = this._listenersMap.get(type).length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this._listenersMap.get(type)[i](var_args)) return true;
		}
		return false;
	}
	,removeEventListener: function(type,callback) {
		if(!this._listenersMap.exists(type)) return;
		HxOverrides.remove(this._listenersMap.get(type),callback);
	}
	,addEventListener: function(type,callback) {
		if(!this._listenersMap.exists(type)) {
			var v = [];
			this._listenersMap.set(type,v);
			v;
		}
		this._listenersMap.get(type).push(callback);
	}
	,__class__: models.network.EventSource
}
models.network.HttpServer = function() {
	models.network.EventSource.call(this);
	this._readyState = 0;
};
models.network.HttpServer.__name__ = true;
models.network.HttpServer.__super__ = models.network.EventSource;
models.network.HttpServer.prototype = $extend(models.network.EventSource.prototype,{
	socketId: function() {
		return this._createInfo.socketId;
	}
	,_onRequest: function(request) {
		var type = request.headers.exists("Upgrade")?"upgrade":"request";
		var keepAlive = request.headers.get("Connection") == "keep-alive";
		if(!this.dispatchEvent(type,request)) request.close(); else if(keepAlive) this._readRequestFromSocket(request.socketId);
	}
	,_readRequestFromSocket: function(socketId) {
		var _g = this;
		var requestData = "";
		var endIndex = 0;
		var onDataRead = (function($this) {
			var $r;
			var onDataRead1 = null;
			onDataRead1 = function(readInfo) {
				if(readInfo.resultCode <= 0) {
					chrome.socket.disconnect(socketId);
					chrome.socket.destroy(socketId);
					return;
				}
				var rawString = models.network.Http.arrayBufferToString(readInfo.data);
				requestData += StringTools.replace(rawString,"\r\n","\n");
				endIndex = requestData.indexOf("\n\n",endIndex);
				if(endIndex == -1) {
					endIndex = requestData.length - 1;
					chrome.socket.read(socketId,null,onDataRead1);
					return;
				}
				var headers = requestData.substring(0,endIndex).split("\n");
				var headerMap = new haxe.ds.StringMap();
				var requestLine = headers[0].split(" ");
				var v = requestLine[0];
				headerMap.set("method",v);
				v;
				var v = requestLine[1];
				headerMap.set("url",v);
				v;
				var v = requestLine[2];
				headerMap.set("Http-Version",v);
				v;
				var _g1 = 1, _g2 = headers.length;
				while(_g1 < _g2) {
					var i = _g1++;
					requestLine = headers[i].split(":");
					if(requestLine.length >= 2) {
						var v = StringTools.trim(requestLine[1]);
						headerMap.set(requestLine[0],v);
						v;
					}
				}
				var request = new models.network.HttpRequest(headerMap,socketId);
				_g._onRequest(request);
			};
			$r = onDataRead1;
			return $r;
		}(this));
		chrome.socket.read(socketId,null,onDataRead);
	}
	,_onConnection: function(acceptInfo) {
		this._readRequestFromSocket(acceptInfo.socketId);
	}
	,_acceptConnection: function(socketId) {
		var _g = this;
		chrome.socket.accept(this._createInfo.socketId,function(acceptInfo) {
			_g._onConnection(acceptInfo);
			_g._acceptConnection(acceptInfo.socketId);
		});
	}
	,listen: function(port,opt_host) {
		var _g = this;
		chrome.socket.create("tcp",{ },function(socketInfo) {
			_g._createInfo = socketInfo;
			var address = "0.0.0.0";
			chrome.socket.listen(_g._createInfo.socketId,address,port,50,function(result) {
				_g._readyState = 0;
				_g._acceptConnection(_g._createInfo.socketId);
			});
		});
	}
	,__class__: models.network.HttpServer
});
models.network.HttpRequest = function(headers,socketId) {
	this.version = "HTTP/1.1";
	this.headers = headers;
	this.headersSent = false;
	this.socketId = socketId;
	this._writes = 0;
	this.bytesRemaining = 0;
	this._finished = false;
	this.readyState = 1;
	this.extensionTypes = new haxe.ds.StringMap();
	this.extensionTypes.set("css","text/css");
	"text/css";
	this.extensionTypes.set("html","text/html");
	"text/html";
	this.extensionTypes.set("htm","text/html");
	"text/html";
	this.extensionTypes.set("jpg","image/jpeg");
	"image/jpeg";
	this.extensionTypes.set("jpeg","image/jpeg");
	"image/jpeg";
	this.extensionTypes.set("js","text/javascript");
	"text/javascript";
	this.extensionTypes.set("png","image/png");
	"image/png";
	this.extensionTypes.set("svg","image/svg+xml");
	"image/svg+xml";
	this.extensionTypes.set("txt","text/plain");
	"text/plain";
};
models.network.HttpRequest.__name__ = true;
models.network.HttpRequest.prototype = {
	_checkFinished: function() {
		if(!this._finished || this.bytesRemaining > 0) return;
		this.close();
	}
	,_write: function(array) {
		var _g = this;
		this.bytesRemaining += array.byteLength;
		chrome.socket.write(this.socketId,array,function(writeInfo) {
			if(writeInfo.bytesWritten < 0) return;
			_g.bytesRemaining -= writeInfo.bytesWritten;
			_g._checkFinished();
		});
	}
	,serveUrl: function(url) {
		var t = this;
		var xhr = new XMLHttpRequest();
		xhr.onloadend = function(e) {
			var type = "text/plain";
			if(xhr.getResponseHeader("Content-Type") != null) type = xhr.getResponseHeader("Content-Type"); else if(url.indexOf(".") != -1) {
				var extension = HxOverrides.substr(url,url.indexOf(".") + 1,null);
				type = t.extensionTypes.exists(extension)?t.extensionTypes.get(extension):type;
			}
			var contentLength = Std.parseInt(xhr.getResponseHeader("Content-Length"));
			if(xhr.status == 200) contentLength = xhr.response == null?0:xhr.response.byteLength;
			var map = new haxe.ds.StringMap();
			map.set("Content-Type",type);
			map.set("Content-Length","" + contentLength);
			t.writeHead(xhr.status,map);
			t.end(xhr.response);
		};
		xhr.open("GET",url,true);
		xhr.responseType = "arraybuffer";
		xhr.send();
	}
	,end: function(opt_data) {
		if(opt_data != null) this.writeArrayBuffer(opt_data);
		if(this._responseHeaders.get("Transfer-Encoding") == "chunked") this.writeString("");
		this._finished = true;
		this._checkFinished();
	}
	,writeString: function(data) {
		var retBuffer;
		if(this._responseHeaders.get("Transfer-Encoding") == "chunked") {
			var newline = "\r\n";
			var byteLength = data.length;
			var chunkLength = StringTools.hex(byteLength).toUpperCase() + newline;
			var buffer = new ArrayBuffer(chunkLength.length + byteLength + newline.length);
			var bufferView = new Uint8Array(buffer);
			var _g1 = 0, _g = chunkLength.length;
			while(_g1 < _g) {
				var i = _g1++;
				bufferView[i] = HxOverrides.cca(chunkLength,i);
			}
			var _g1 = 0, _g = data.length;
			while(_g1 < _g) {
				var i = _g1++;
				bufferView[chunkLength.length + i] = HxOverrides.cca(data,i);
			}
			var _g1 = 0, _g = newline.length;
			while(_g1 < _g) {
				var i = _g1++;
				bufferView[chunkLength.length + byteLength + i] = HxOverrides.cca(newline,i);
			}
			retBuffer = buffer;
		} else retBuffer = models.network.Http.stringToArrayBuffer(data);
		this._write(retBuffer);
	}
	,writeArrayBuffer: function(data) {
		if(this._responseHeaders.get("Transfer-Encoding") == "chunked") {
			var newline = "\r\n";
			var byteLength = data.byteLength;
			var chunkLength = StringTools.hex(byteLength).toUpperCase() + newline;
			var buffer = new ArrayBuffer(chunkLength.length + byteLength + newline.length);
			var bufferView = new Uint8Array(buffer);
			var _g1 = 0, _g = chunkLength.length;
			while(_g1 < _g) {
				var i = _g1++;
				bufferView[i] = HxOverrides.cca(chunkLength,i);
			}
			bufferView.set(new Uint8Array(data),chunkLength.length);
			var _g1 = 0, _g = newline.length;
			while(_g1 < _g) {
				var i = _g1++;
				bufferView[chunkLength.length + byteLength + i] = HxOverrides.cca(newline,i);
			}
			data = buffer;
		}
		this._write(data);
	}
	,writeHead: function(responseCode,responseHeaders) {
		var code = models.network.Http.statusCode.exists("" + responseCode)?models.network.Http.statusCode.get("" + responseCode):"Unknown";
		var headerString = "" + this.version + " " + responseCode + " " + code;
		if(this.headers.get("Connection") == "keep-alive") {
			responseHeaders.set("Connection","keep-alive");
			"keep-alive";
		}
		if(!responseHeaders.exists("Content-Length") && responseHeaders.get("Connection") == "keep-alive") {
			responseHeaders.set("Transfer-Encoding","chunked");
			"chunked";
		}
		var $it0 = responseHeaders.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			headerString += "\r\n" + key + ": " + responseHeaders.get(key);
		}
		headerString += "\r\n\r\n";
		this._responseHeaders = responseHeaders;
		this._write(models.network.Http.stringToArrayBuffer(headerString));
	}
	,close: function() {
		if(this.headers.get("Connection") != "keep-alive") {
			chrome.socket.disconnect(this.socketId);
			chrome.socket.destroy(this.socketId);
		}
		this.socketId = 0;
		this.readyState = 3;
	}
	,__class__: models.network.HttpRequest
}
models.network.WebSocketServer = function(httpServer) {
	models.network.EventSource.call(this);
	httpServer.addEventListener("upgrade",$bind(this,this._upgradeToWebSocket));
};
models.network.WebSocketServer.__name__ = true;
models.network.WebSocketServer.__super__ = models.network.EventSource;
models.network.WebSocketServer.prototype = $extend(models.network.EventSource.prototype,{
	_upgradeToWebSocket: function(request) {
		if(request.headers.get("Upgrade") != "websocket" || request.headers.get("Sec-WebSocket-Key") == null) return false;
		var webSocketRequests = new models.network.WebSocketRequests(request);
		if(this.dispatchEvent("request",webSocketRequests)) {
			if(webSocketRequests.socketId == null) webSocketRequests.reject();
			return true;
		}
		return false;
	}
	,__class__: models.network.WebSocketServer
});
models.network.WebSocketRequests = function(httpRequest) {
	models.network.HttpRequest.call(this,httpRequest.headers,httpRequest.socketId);
	httpRequest.socketId = 0;
};
models.network.WebSocketRequests.__name__ = true;
models.network.WebSocketRequests.__super__ = models.network.HttpRequest;
models.network.WebSocketRequests.prototype = $extend(models.network.HttpRequest.prototype,{
	reject: function() {
		this.close();
	}
	,accept: function() {
		var clientKey = this.headers.get("Sec-WebSocket-Key");
		var toArray = function(str) {
			var a = [];
			var _g1 = 0, _g = str.length;
			while(_g1 < _g) {
				var i = _g1++;
				a.push(HxOverrides.cca(str,i));
			}
			return a;
		};
		var toString = function(a) {
			var str = "";
			var _g1 = 0, _g = a.length;
			while(_g1 < _g) {
				var i = _g1++;
				str += String.fromCharCode(a[i]);
			}
			return str;
		};
		var magicStr = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
		clientKey += magicStr;
		var sha1 = new models.network.Sha1();
		sha1.reset();
		var array = toArray(clientKey);
		sha1.update(array,array.length);
		var responseKey = js.Browser.window.btoa(toString(sha1.digest()));
		var responseHeader = new haxe.ds.StringMap();
		responseHeader.set("Upgrade","websocket");
		"websocket";
		responseHeader.set("Connection","Upgrade");
		"Upgrade";
		responseHeader.set("Sec-WebSocket-Accept",responseKey);
		responseKey;
		if(this.headers.exists("Sec-WebSocket-Protocol")) {
			var v = this.headers.get("Sec-WebSocket-Protocol");
			responseHeader.set("Sec-WebSocket-Protocol",v);
			v;
		}
		this.writeHead(101,responseHeader);
		var socket = new models.network.WebSocketServerSocket(this.socketId);
		this.socketId = 0;
		return socket;
	}
	,__class__: models.network.WebSocketRequests
});
models.network.WebSocketServerSocket = function(soketId) {
	models.network.EventSource.call(this);
	this._socketId = soketId;
	this._readFromSocket();
};
models.network.WebSocketServerSocket.__name__ = true;
models.network.WebSocketServerSocket.__super__ = models.network.EventSource;
models.network.WebSocketServerSocket.prototype = $extend(models.network.EventSource.prototype,{
	_close: function() {
		chrome.socket.disconnect(this._socketId);
		chrome.socket.destroy(this._socketId);
		this.readyState = 3;
		this.dispatchEvent("close");
	}
	,_sendFrame: function(op,data) {
		var _g = this;
		var t = this;
		var WebsocketFrameString = function(op1,str) {
			var length = str.length;
			if(str.length > 65535) length += 10; else if(str.length > 125) length += 4; else length += 2;
			var lengthBytes = 0;
			var buffer = new ArrayBuffer(length);
			var bv = new Uint8Array(buffer);
			bv[0] = 128 | op1 & 15;
			bv[1] = str.length > 65535?127:str.length > 125?126:str.length;
			if(str.length > 65535) lengthBytes = 8; else if(str.length > 125) lengthBytes = 2;
			var len = str.length;
			var i = lengthBytes - 1;
			while(i >= 0) {
				bv[2 + i] = len & 255;
				len = len >> 8;
				i--;
			}
			var dataStart = lengthBytes + 2;
			var _g1 = 0, _g2 = str.length;
			while(_g1 < _g2) {
				var x = _g1++;
				bv[dataStart + x] = HxOverrides.cca(str,x);
			}
			return buffer;
		};
		var param = data != null?data:"";
		var array = WebsocketFrameString(op,param);
		chrome.socket.write(this._socketId,array,function(writeInfo) {
			if(writeInfo.bytesWritten != array.byteLength) _g._close();
		});
	}
	,_onFrame: function(op,data) {
		if(op == 1) {
			var message = new haxe.ds.StringMap();
			message.set("data",data);
			data;
			this.dispatchEvent("message",message);
		} else if(op == 8) {
			if(this.readyState == 1) this._sendFrame(8,null); else {
				this._close();
				return false;
			}
		}
		return true;
	}
	,_readFromSocket: function() {
		var _g = this;
		var t = this;
		var data = [];
		var message = "";
		var fragmentedOp = 0;
		var fragmentedMessage = "";
		var onDataRead = (function($this) {
			var $r;
			var onDataRead1 = null;
			onDataRead1 = function(readInfo) {
				if(readInfo.resultCode <= 0) {
					t._close();
					return;
				}
				if(readInfo.data.byteLength == null) {
					chrome.socket.read(t._socketId,null,onDataRead1);
					return;
				}
				var a = new Uint8Array(readInfo.data);
				var _g1 = 0, _g2 = a.length;
				while(_g1 < _g2) {
					var i = _g1++;
					data.push(a[i]);
				}
				while(data.length > 0) {
					var length_code = -1;
					var data_start = 6;
					var mask = [];
					var fin = (data[0] & 128) >> 7;
					var op = data[0] & 15;
					if(data.length > 1) length_code = data[1] & 127;
					if(length_code > 125) {
						if(length_code == 126 && data.length > 7 || length_code == 127 && data.length > 14) {
							if(length_code == 126) {
								length_code = data[2] * 256 + data[3];
								mask = data.slice(4,8);
								data_start = 8;
							} else if(length_code == 127) {
								length_code = 0;
								var _g1 = 0;
								while(_g1 < 8) {
									var i = _g1++;
									length_code = length_code * 256 + data[2 + i];
								}
								mask = data.slice(10,14);
								data_start = 14;
							}
						} else length_code = -1;
					} else if(data.length > 5) mask = data.slice(2,6);
					if(length_code > -1 && data.length >= data_start + length_code) {
						var decoded = data.slice(data_start,data_start + length_code);
						var _g1 = 0, _g2 = decoded.length;
						while(_g1 < _g2) {
							var i = _g1++;
							decoded[i] = decoded[i] ^ mask[i % 4];
						}
						data = data.slice(data_start + length_code);
						if(fin != 0 && op > 0) {
							if(!_g._onFrame(op,models.network.Http.arrayBufferToString(models.network.Http.arrayToArrayBuffer(decoded)))) return;
						} else {
							fragmentedOp = fragmentedOp != 0?fragmentedOp:op;
							fragmentedMessage += models.network.Http.arrayBufferToString(models.network.Http.arrayToArrayBuffer(decoded));
							if(fin != 0) {
								if(!t._onFrame(fragmentedOp,fragmentedMessage)) return;
								fragmentedOp = 0;
								fragmentedMessage = "";
							}
						}
					} else break;
				}
				chrome.socket.read(t._socketId,null,onDataRead1);
			};
			$r = onDataRead1;
			return $r;
		}(this));
		chrome.socket.read(this._socketId,null,onDataRead);
	}
	,close: function() {
		this._sendFrame(8,null);
		this.readyState = 2;
	}
	,send: function(data) {
		this._sendFrame(1,data);
	}
	,__class__: models.network.WebSocketServerSocket
});
models.network.Sha1 = function() {
	this._chain = new Array();
	this._buf = new Array();
	this._W = new Array();
	this._pad = new Array();
	this._pad.push(128);
	var _g = 1;
	while(_g < 64) {
		var i = _g++;
		this._pad.push(0);
	}
	this.reset();
};
models.network.Sha1.__name__ = true;
models.network.Sha1.prototype = {
	digest: function() {
		var digest = [];
		var totalBits = this._total * 8;
		if(this._inbuf < 56) this.update(this._pad,56 - this._inbuf); else this.update(this._pad,64 - (this._inbuf - 56));
		var _g = -63;
		while(_g < -55) {
			var i = _g++;
			this._buf[-i] = totalBits & 255;
			totalBits >>>= 8;
		}
		this._compress(this._buf);
		var n = 0;
		var _g = 0;
		while(_g < 5) {
			var i = _g++;
			var _g1 = 0, _g2 = [24,16,8,0];
			while(_g1 < _g2.length) {
				var j = _g2[_g1];
				++_g1;
				digest[n++] = this._chain[i] >> j & 255;
			}
		}
		return digest;
	}
	,update: function(bytes,opt_length) {
		var n = 0;
		if(this._inbuf == 0) while(n + 64 < opt_length) {
			this._compress(bytes.slice(n,n + 64));
			n += 64;
			this._total += 64;
		}
		while(n < opt_length) {
			this._buf[this._inbuf++] = bytes[n++];
			this._total++;
			if(this._inbuf == 64) {
				this._inbuf = 0;
				this._compress(this._buf);
				while(n + 64 < opt_length) {
					this._compress(bytes.slice(n,n + 64));
					n += 64;
					this._total += 64;
				}
			}
		}
	}
	,_compress: function(buf) {
		var W = this._W;
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			if(i % 4 != 0) continue;
			var w = buf[i] << 24 | buf[i + 1] << 16 | buf[i + 2] << 8 | buf[i + 3];
			W[i / 4 | 0] = w;
		}
		var _g = 16;
		while(_g < 80) {
			var i = _g++;
			W[i] = this._rotl(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16],1);
		}
		var a = this._chain[0];
		var b = this._chain[1];
		var c = this._chain[2];
		var d = this._chain[3];
		var e = this._chain[4];
		var f, k;
		var _g = 0;
		while(_g < 80) {
			var i = _g++;
			if(i < 40) {
				if(i < 20) {
					f = d ^ b & (c ^ d);
					k = 1518500249;
				} else {
					f = b ^ c ^ d;
					k = 1859775393;
				}
			} else if(i < 60) {
				f = b & c | d & (b | c);
				k = -1894007588;
			} else {
				f = b ^ c ^ d;
				k = -899497514;
			}
			var t = this._rotl(a,5) + f + e + k + W[i] & -1;
			e = d;
			d = c;
			c = this._rotl(b,30);
			b = a;
			a = t;
		}
		this._chain[0] = this._chain[0] + a & -1;
		this._chain[1] = this._chain[1] + b & -1;
		this._chain[2] = this._chain[2] + c & -1;
		this._chain[3] = this._chain[3] + d & -1;
		this._chain[4] = this._chain[4] + e & -1;
	}
	,_rotl: function(w,r) {
		return (w << r | w >>> 32 - r) & -1;
	}
	,reset: function() {
		this._chain[0] = 1732584193;
		this._chain[1] = -271733879;
		this._chain[2] = -1732584194;
		this._chain[3] = 271733878;
		this._chain[4] = -1009589776;
		this._inbuf = 0;
		this._total = 0;
	}
	,__class__: models.network.Sha1
}
models.network.SocketType = { __ename__ : true, __constructs__ : ["TCP","UDP"] }
models.network.SocketType.TCP = ["TCP",0];
models.network.SocketType.TCP.toString = $estr;
models.network.SocketType.TCP.__enum__ = models.network.SocketType;
models.network.SocketType.UDP = ["UDP",1];
models.network.SocketType.UDP.toString = $estr;
models.network.SocketType.UDP.__enum__ = models.network.SocketType;
models.network.SocketFactory = function() { }
models.network.SocketFactory.__name__ = true;
models.network.SocketFactory.create = function(socketType,callback) {
	var type = (function($this) {
		var $r;
		switch( (socketType)[1] ) {
		case 0:
			$r = "tcp";
			break;
		case 1:
			$r = "udp";
			break;
		}
		return $r;
	}(this));
	chrome.socket.create(type,{ },function(createInfo) {
		var retSocket = (function($this) {
			var $r;
			switch( (socketType)[1] ) {
			case 0:
				$r = null;
				break;
			case 1:
				$r = new models.network.UdpSocket(createInfo.socketId);
				break;
			}
			return $r;
		}(this));
		callback(retSocket);
	});
}
models.network.AbstractSocket = function(socketId) {
	this.socketId = socketId;
};
models.network.AbstractSocket.__name__ = true;
models.network.AbstractSocket.prototype = {
	__class__: models.network.AbstractSocket
}
models.network.UdpSocket = function(socketId) {
	this.socketType = models.network.SocketType.UDP;
	this.recvDataCallback = null;
	models.network.AbstractSocket.call(this,socketId);
};
models.network.UdpSocket.__name__ = true;
models.network.UdpSocket.__super__ = models.network.AbstractSocket;
models.network.UdpSocket.prototype = $extend(models.network.AbstractSocket.prototype,{
	onRecvUdpDatagram: function(callback) {
		this.recvDataCallback = callback;
		this.recvUdpDatagram();
	}
	,sendMessage: function(message,targetAddress,targetPort) {
		var sendData = models.common.Util.stringToArrayBuffer(message);
		chrome.socket.sendTo(this.socketId,sendData,targetAddress,targetPort,function(writeInfo) {
		});
	}
	,recvUdpDatagram: function() {
		var _g = this;
		chrome.socket.recvFrom(this.socketId,null,function(recvData) {
			if(_g.recvDataCallback != null) _g.recvDataCallback(recvData);
			_g.recvUdpDatagram();
		});
	}
	,joinMulticastGroup: function(multicastAddress,ttl,callback) {
		var _g = this;
		chrome.socket.setMulticastTimeToLive(this.socketId,12,function(setTTLResult) {
			chrome.socket.joinGroup(_g.socketId,multicastAddress,function(joinGroupResult) {
				callback(true);
			});
		});
	}
	,bind: function(port,ip,callback) {
		this.localPort = port;
		this.localIp = ip == null?"0.0.0.0":ip;
		chrome.socket.bind(this.socketId,this.localIp,this.localPort,function(result) {
			if(result != 0) callback(false); else callback(true);
		});
	}
	,__class__: models.network.UdpSocket
});
models.ssdp = {}
models.ssdp.SSDPReceiver = function(port) {
	var _g1 = this;
	this.defaultPortSocket = null;
	this.sendSocket = null;
	this.uuid = models.common.Util.uuidCreate();
	this.ST = "upnp:sakkuruDevice";
	this.max_age = 600;
	this.location = null;
	this.server = "sakkuru.com";
	this.localIpHash = new haxe.ds.StringMap();
	this.address = null;
	this.peerJsPort = port;
	chrome.socket.getNetworkList(function(list) {
		var _g = 0;
		while(_g < list.length) {
			var item = list[_g];
			++_g;
			if(models.common.Util.isIpv4(item.address)) {
				_g1.address = _g1.address == null?item.address:_g1.address;
				_g1.localIpHash.set(item.address,item);
				item;
			}
		}
		_g1.location = _g1.location == null?"http://" + _g1.address + ":39635/" + _g1.uuid + ".xml":_g1.location;
		_g1.createSockets(function() {
			_g1.sendNotify();
			_g1.httpServer = new models.network.HttpServer();
			_g1.httpServer.listen(39635);
			_g1.httpServer.addEventListener("request",_g1.serveDescriptionFile());
		});
	});
};
models.ssdp.SSDPReceiver.__name__ = true;
models.ssdp.SSDPReceiver.prototype = {
	serveDescriptionFile: function() {
		var descriptionMessage = new models.ssdp.messages.SSDPDescriptionMessage();
		var sendMessage = descriptionMessage.createMessage(1,0,this.uuid,"upnp-detector","NTT Communications","urn:schemas-ntt-com:service:upnp-packagedapps","urn:schemas-ntt-com:service:upnp-packagedapps","http://127.0.0.1/",this.address,this.peerJsPort);
		return function(req) {
			var text = "hogehoge";
			var map = new haxe.ds.StringMap();
			map.set("Content-Type","text/xml");
			"text/xml";
			var v = "" + sendMessage.length;
			map.set("Content-Length",v);
			v;
			req.writeHead(200,map);
			req.writeString(sendMessage);
			return true;
		};
	}
	,sendNotify: function() {
		var _g = this;
		var notifyMessage = new models.ssdp.messages.SSDPNotifyMessage();
		var sendMessage = notifyMessage.createMessage(this.uuid,this.ST,this.max_age,this.location,this.server);
		var subSendNotify = (function($this) {
			var $r;
			var subSendNotify1 = null;
			subSendNotify1 = function() {
				_g.sendSocket.sendMessage(sendMessage,"239.255.255.250",1900);
				haxe.Timer.delay(subSendNotify1,2000);
			};
			$r = subSendNotify1;
			return $r;
		}(this));
		haxe.Timer.delay(subSendNotify,2000);
	}
	,sendMSearchResponse: function(stKey,address,port) {
		var responseMessage = new models.ssdp.messages.SSDPResponseMessage();
		var message = responseMessage.createMessage(models.common.Util.uuidCreate(),this.ST,this.max_age,this.location,this.server);
		this.sendSocket.sendMessage(message,address,port);
	}
	,recvMSearchMessage: function(recvMessage,recvInfo) {
		var lines = recvMessage.split("\n");
		var _g = 0;
		while(_g < lines.length) {
			var line = lines[_g];
			++_g;
			if(StringTools.startsWith(line,"ST")) {
				var allPos = line.indexOf("ssdp:all");
				var rootPos = line.indexOf("upnp:rootdevice");
				var keyPos = line.indexOf("key");
				var pos = Math.max(Math.max(allPos,rootPos),keyPos) | 0;
				if(pos < 0) return;
				var sub = line.substring(pos,line.length - 1);
				var r = new EReg("(\\s|\n|\r)*","g");
				var stKey = r.replace(sub,"");
				this.sendMSearchResponse(stKey,recvInfo.address,recvInfo.port);
				break;
			}
		}
	}
	,recvUnicastPacket: function(recvInfo) {
		if(this.localIpHash.exists(recvInfo.address)) return;
	}
	,recvMulticastPacket: function(recvInfo) {
		if(this.localIpHash.exists(recvInfo.address)) {
			var recvMessage = models.common.Util.arrayBufferToString(recvInfo.data);
			return;
		}
		var recvMessage = models.common.Util.arrayBufferToString(recvInfo.data);
		if(StringTools.startsWith(recvMessage,"M-SEARCH * HTTP/1.1")) this.recvMSearchMessage(recvMessage,recvInfo);
	}
	,createSockets: function(callback) {
		var _g = this;
		models.network.SocketFactory.create(models.network.SocketType.UDP,function(socket) {
			_g.defaultPortSocket = js.Boot.__cast(socket , models.network.UdpSocket);
			_g.defaultPortSocket.bind(1900,"0.0.0.0",function(b) {
				_g.defaultPortSocket.joinMulticastGroup("239.255.255.250",12,function(bb) {
					_g.defaultPortSocket.onRecvUdpDatagram($bind(_g,_g.recvMulticastPacket));
					models.network.SocketFactory.create(models.network.SocketType.UDP,function(socket2) {
						_g.sendSocket = js.Boot.__cast(socket2 , models.network.UdpSocket);
						_g.sendSocket.bind(0,"0.0.0.0",function(c) {
							_g.sendSocket.onRecvUdpDatagram($bind(_g,_g.recvUnicastPacket));
							callback();
						});
					});
				});
			});
		});
	}
	,__class__: models.ssdp.SSDPReceiver
}
models.ssdp.SSDPManager = function(port) {
	models.ssdp.SSDPReceiver.call(this,port);
};
models.ssdp.SSDPManager.__name__ = true;
models.ssdp.SSDPManager.__super__ = models.ssdp.SSDPReceiver;
models.ssdp.SSDPManager.prototype = $extend(models.ssdp.SSDPReceiver.prototype,{
	__class__: models.ssdp.SSDPManager
});
models.ssdp.messages = {}
models.ssdp.messages.SSDPDescriptionMessage = function() {
};
models.ssdp.messages.SSDPDescriptionMessage.__name__ = true;
models.ssdp.messages.SSDPDescriptionMessage.prototype = {
	createMessage: function(majorVersion,minorVersion,uuid,friendlyName,manufacture,serviceType,serviceID,controlURL,address,port) {
		return "<?xml version=\"1.0\"?>\r\n" + "<root xmlns=\"urn:schemas-upnp-org:device-1-0\">\r\n" + "<specVersion>\r\n" + "<major>" + majorVersion + "</major>\r\n" + "<minor>" + minorVersion + "</minor>\r\n" + "</specVersion>\r\n" + "<device>\r\n" + "<UDN>" + uuid + "</UDN>\r\n" + "<friendlyName>" + friendlyName + "</friendlyName>\r\n" + "<manufacturer>" + manufacture + "</manufacturer>\r\n" + "<serviceList>" + "<service>" + "<serviceType>" + serviceType + "</serviceType>" + "<serviceId>" + serviceID + "</serviceId>" + "<SCPDURL>/sakkuru.xml</SCPDURL>" + "<controlURL>" + controlURL + "</controlURL>" + "<eventSubURL>/event?Sakkuru</eventSubURL>" + "<address>" + address + "</address>" + "<port>" + port + "</port>" + "</service>" + "</serviceList>" + "</device>\r\n" + "</root>\r\n" + "\r\n";
	}
	,__class__: models.ssdp.messages.SSDPDescriptionMessage
}
models.ssdp.messages.SSDPNotifyMessage = function() {
};
models.ssdp.messages.SSDPNotifyMessage.__name__ = true;
models.ssdp.messages.SSDPNotifyMessage.prototype = {
	createMessage: function(uuid,ST,max_age,location,server) {
		this.uuid = uuid;
		this.ST = ST;
		this.max_age = max_age;
		this.location = location;
		this.server = server;
		this.USN = this.uuid + this.ST;
		return "NOTIFY * HTTP/1.1\r\n" + "Host:239.255.255.250:1900\r\n" + "NT:urn:ntt.com:service:SakkuruDevice:1\r\n" + "NTS:ssdp:alive\r\n" + "Location:" + this.location + "\r\n" + "USN:" + this.USN + "\r\n" + "ST:" + this.ST + "\r\n" + "Cache-Control:max-age=" + this.max_age + "\r\n" + "Server:" + this.server + "\r\n" + "01-NLS:f7a52ae55df1ead648b4698d5f096800\r\n\r\n";
	}
	,__class__: models.ssdp.messages.SSDPNotifyMessage
}
models.ssdp.messages.SSDPResponseMessage = function() {
};
models.ssdp.messages.SSDPResponseMessage.__name__ = true;
models.ssdp.messages.SSDPResponseMessage.prototype = {
	createMessage: function(uuid,ST,max_age,location,server) {
		this.uuid = uuid;
		this.ST = ST;
		this.max_age = max_age;
		this.location = location;
		this.server = server;
		this.USN = this.uuid + this.ST;
		return "HTTP/1.1 200 OK\r\n" + "CACHE-CONTROL: max-age=" + this.max_age + "\r\n" + "LOCATION: " + this.location + "\r\n" + "SERVER: " + this.server + "\r\n" + "ST: " + this.ST + "\r\n" + "USN: " + this.USN + "\r\n" + "EXT:" + "\r\n\r\n";
	}
	,__class__: models.ssdp.messages.SSDPResponseMessage
}
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; };
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var q = window.jQuery;
js.JQuery = q;
js.Browser.window = typeof window != "undefined" ? window : null;
models.network.Http.statusCode = new haxe.ds.StringMap();
Main.main();
})();

//@ sourceMappingURL=main.js.map