#PeerJs-PackagedApps
==============

[peerjs-server](https://github.com/peers/peerjs-server "peerjs-server")をPackagedAppsで動かしてみるプロジェクト。  
現状、Mar 10, 2014版のソースコード([server.js](https://github.com/peers/peerjs-server/blob/master/lib/server.js "server.js"), [util.js](https://github.com/peers/peerjs-server/blob/master/lib/util.js "util.js"))がほぼそのまま動く。  
PackagedAppsの場合、SSLはオレオレ証明書で動かすしかなく、とりあえずコンセプトデモとして動かすことが優先なので、  
現時点ではSSLのパラメータについては無視して実装している。

###本家との差分
####server.js
- 1行目から6行目までの、requireを削除
- 9行目の EventEmitter.call(this); を削除
- 61行目のinheritsを削除
- 69行目のnew WebSocketServerの名前空間を変更
- 154行目のemitを削除
- 450行目の exports.PeerServer = PeerServer; を削除

####util.js
- module.exports = util;を削除(nodeじゃないので)

####peer.js
　単なるランチャーなのでそもそも利用せず。ここで指定しているパラメータは、どっかで指定できるようにしたい。そのうちやる。

####追加機能
　UPnPで発見可能。ssdp:all, upnp:rootdevice, upnp:sakkuruDeviceに応答。
