var PeerJsOptions = (function () {
    function PeerJsOptions() {
        this.key = "peerjs";
        this.host = "0.peerjs.com";
        this.port = 9000;
        this.secure = false;
        this.config = null;
        this.debug = false;
        /*
        0Prints no logs.
        1Prints only errors.
        2Prints errors and warnings.
        3Prints all logs.
        */
        this.ip_limit = 5000;
        this.concurrent_limit = 5000;
        this.timeout = 5000;
    }
    return PeerJsOptions;
})();

var PeerJsServer = (function () {
    function PeerJsServer(_options) {
        this._options = _options;
        this._clients = {};
        this._outstanding = {};
        this._ips = {};
        this._app = new MyRestify();
        if (PeerJsServer._instance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        PeerJsServer._instance = this;

        console.log(Util);

        Util.debug = _options.debug;
        this._app = new MyRestify();
        this._clients = {};
        this._outstanding = {};
        this._initializeWSS();
        this._initializeHTTP();
        this._ips = {};
        this._setCleanupIntervals();
    }
    PeerJsServer.getInstance = function (option) {
        if (PeerJsServer._instance === null) {
            PeerJsServer._instance = new PeerJsServer(option);
        }
        return PeerJsServer._instance;
    };

    PeerJsServer.prototype._initializeWSS = function () {
        var self = this;

        // Create WebSocket server as well.
        this._wss = new WebSocketServer({ path: '/peerjs', server: this._app });

        this._wss.on('connection', function (socket, query) {
            var id = query['id'];
            var token = query['token'];
            var key = query['key'];
            var ip = query['ip'];

            if (!id || !token || !key) {
                socket.send(JSON.stringify({ type: 'ERROR', payload: { msg: 'No id, token, or key supplied to websocket server' } }));
                socket.close();
                return;
            }

            if (!self._clients[key] || !self._clients[key][id]) {
                self._checkKey(key, ip, function (err) {
                    if (!err) {
                        if (!self._clients[key][id]) {
                            self._clients[key][id] = { token: token, ip: ip };
                            self._ips[ip]++;
                            socket.send(JSON.stringify({ type: 'OPEN' }));
                        }
                        self._configureWS(socket, key, id, token);
                    } else {
                        socket.send(JSON.stringify({ type: 'ERROR', payload: { msg: err } }));
                    }
                });
            } else {
                self._configureWS(socket, key, id, token);
            }
        });
    };

    PeerJsServer.prototype._configureWS = function (socket, key, id, token) {
        var self = this;
        var client = this._clients[key][id];

        if (token === client.token) {
            // res 'close' event will delete client.res for us
            client.socket = socket;

            if (client.res) {
                client.res.end();
            }
        } else {
            // ID-taken, invalid token
            socket.send(JSON.stringify({ type: 'ID-TAKEN', payload: { msg: 'ID is taken' } }));
            socket.close();
            return;
        }

        this._processOutstanding(key, id);

        // Cleanup after a socket closes.
        socket.on('close', function () {
            Util.log('Socket closed:', id);
            if (client.socket == socket) {
                self._removePeer(key, id);
            }
        });

        // Handle messages from peers.
        socket.on('message', function (data) {
            try  {
                var message = JSON.parse(data);

                if (['LEAVE', 'CANDIDATE', 'OFFER', 'ANSWER'].indexOf(message.type) !== -1) {
                    self._handleTransmission(key, {
                        type: message.type,
                        src: id,
                        dst: message.dst,
                        payload: message.payload
                    });
                } else {
                    Util.prettyError('Message unrecognized');
                }
            } catch (e) {
                Util.log('Invalid message', data);
                throw e;
            }
        });
    };

    PeerJsServer.prototype._checkKey = function (key, ip, cb) {
        if (key == this._options.key) {
            if (!this._clients[key]) {
                this._clients[key] = {};
            }
            if (!this._outstanding[key]) {
                this._outstanding[key] = {};
            }
            if (!this._ips[ip]) {
                this._ips[ip] = 0;
            }

            if (Object.keys(this._clients[key]).length >= this._options.concurrent_limit) {
                cb('Server has reached its concurrent user limit');
                return;
            }
            if (this._ips[ip] >= this._options.ip_limit) {
                cb(ip + ' has reached its concurrent user limit');
                return;
            }
            cb(null);
        } else {
            cb('Invalid key provided');
        }
    };

    PeerJsServer.prototype._initializeHTTP = function () {
        var self = this;

        /*
        this._app.use(restify.bodyParser({ mapParams: false }));
        this._app.use(restify.queryParser());
        this._app.use(Util.allowCrossDomain);
        */
        // Retrieve guaranteed random ID.
        this._app.get('/:key/id', function (req, res, next) {
            res.contentType = 'text/html';
            res.send(self._generateClientId(req.params.key));
            return next();
        });

        // Server sets up HTTP streaming when you get post an ID.
        this._app.post('/:key/:id/:token/id', function (req, res, next) {
            var id = req.params.id;
            var token = req.params.token;
            var key = req.params.key;
            var ip = req.connection.remoteAddress;

            if (!self._clients[key] || !self._clients[key][id]) {
                self._checkKey(key, ip, function (err) {
                    if (!err && !self._clients[key][id]) {
                        self._clients[key][id] = { token: token, ip: ip };
                        self._ips[ip]++;
                        self._startStreaming(res, key, id, token, true);
                    } else {
                        res.send(JSON.stringify({ type: 'HTTP-ERROR' }));
                    }
                });
            } else {
                self._startStreaming(res, key, id, token, false);
            }
            return next();
        });

        var handle = function (req, res, next) {
            var key = req.params.key;
            var id = req.params.id;

            var client;
            if (!self._clients[key] || !(client = self._clients[key][id])) {
                if (req.params.retry) {
                    res.send(401);
                } else {
                    // Retry this request
                    req.params.retry = true;
                    setTimeout(handle, 25, req, res);
                }
                return;
            }

            if (req.params.token !== client.token) {
                res.send(401);
                return;
            } else {
                self._handleTransmission(key, {
                    type: req.body.type,
                    src: id,
                    dst: req.body.dst,
                    payload: req.body.payload
                });
                res.send(200);
            }
            return next();
        };

        this._app.post('/:key/:id/:token/offer', handle);

        this._app.post('/:key/:id/:token/candidate', handle);

        this._app.post('/:key/:id/:token/answer', handle);

        this._app.post('/:key/:id/:token/leave', handle);

        // Listen on user-specified port.
        console.log(this);
        console.log(this._options);
        this._app.listen(this._options.port);
    };

    PeerJsServer.prototype._startStreaming = function (res, key, id, token, open) {
        var self = this;

        res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

        var pad = '00';
        for (var i = 0; i < 10; i++) {
            pad += pad;
        }
        res.write(pad + '\n');

        if (open) {
            res.write(JSON.stringify({ type: 'OPEN' }) + '\n');
        }

        var client = this._clients[key][id];

        if (token === client.token) {
            // Client already exists
            res.on('close', function () {
                if (client.res === res) {
                    if (!client.socket) {
                        // No new request yet, peer dead
                        self._removePeer(key, id);
                        return;
                    }
                    delete client.res;
                }
            });
            client.res = res;
            this._processOutstanding(key, id);
        } else {
            // ID-taken, invalid token
            res.end(JSON.stringify({ type: 'HTTP-ERROR' }));
        }
    };

    PeerJsServer.prototype._pruneOutstanding = function () {
        var keys = Object.keys(this._outstanding);
        for (var k = 0, kk = keys.length; k < kk; k += 1) {
            var key = keys[k];
            var dsts = Object.keys(this._outstanding[key]);
            for (var i = 0, ii = dsts.length; i < ii; i += 1) {
                var offers = this._outstanding[key][dsts[i]];
                var seen = {};
                for (var j = 0, jj = offers.length; j < jj; j += 1) {
                    var message = offers[j];
                    if (!seen[message.src]) {
                        this._handleTransmission(key, { type: 'EXPIRE', src: message.dst, dst: message.src });
                        seen[message.src] = true;
                    }
                }
            }
            this._outstanding[key] = {};
        }
    };

    PeerJsServer.prototype._setCleanupIntervals = function () {
        var self = this;

        // Clean up ips every 10 minutes
        setInterval(function () {
            var keys = Object.keys(self._ips);
            for (var i = 0, ii = keys.length; i < ii; i += 1) {
                var key = keys[i];
                if (self._ips[key] === 0) {
                    delete self._ips[key];
                }
            }
        }, 600000);

        // Clean up outstanding messages every 5 seconds
        setInterval(function () {
            self._pruneOutstanding();
        }, 5000);
    };

    PeerJsServer.prototype._processOutstanding = function (key, id) {
        var offers = this._outstanding[key][id];
        if (!offers) {
            return;
        }
        for (var j = 0, jj = offers.length; j < jj; j += 1) {
            this._handleTransmission(key, offers[j]);
        }
        delete this._outstanding[key][id];
    };

    PeerJsServer.prototype._removePeer = function (key, id) {
        if (this._clients[key] && this._clients[key][id]) {
            this._ips[this._clients[key][id].ip]--;
            delete this._clients[key][id];
        }
    };

    PeerJsServer.prototype._handleTransmission = function (key, message) {
        var type = message['type'];
        var src = message['src'];
        var dst = message['dst'];
        var data = JSON.stringify(message);

        var destination = this._clients[key][dst];

        if (destination) {
            try  {
                Util.log(type, 'from', src, 'to', dst);
                if (destination.socket) {
                    destination.socket.send(data);
                } else if (destination.res) {
                    data += '\n';
                    destination.res.write(data);
                } else {
                    throw "Peer dead";
                }
            } catch (e) {
                // This happens when a peer disconnects without closing connections and
                // the associated WebSocket has not closed.
                Util.prettyError(e);

                // Tell other side to stop trying.
                this._removePeer(key, dst);
                this._handleTransmission(key, {
                    type: 'LEAVE',
                    src: dst,
                    dst: src
                });
            }
        } else {
            if (type !== 'LEAVE' && type !== 'EXPIRE' && dst) {
                var self = this;
                if (!this._outstanding[key][dst]) {
                    this._outstanding[key][dst] = [];
                }
                this._outstanding[key][dst].push(message);
            } else if (type === 'LEAVE' && !dst) {
                this._removePeer(key, src);
            } else {
                // Unavailable destination specified with message LEAVE or EXPIRE
                // Ignore
            }
        }
    };

    PeerJsServer.prototype._generateClientId = function (key) {
        var clientId = Util.randomId();
        if (!this._clients[key]) {
            return clientId;
        }
        while (!!this._clients[key][clientId]) {
            clientId = Util.randomId();
        }
        return clientId;
    };
    PeerJsServer._instance = null;
    return PeerJsServer;
})();
//# sourceMappingURL=peerjs_server.js.map
