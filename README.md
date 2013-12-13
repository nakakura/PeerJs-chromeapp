#PeerJs-PackagedApps
==============

[peerjs-server](https://github.com/peers/peerjs-server "peerjs-server")をPackagedAppsで動かしてみるプロジェクト。  
現状、Oct 24, 2013版のソースコード([server.js](https://github.com/peers/peerjs-server/blob/master/lib/server.js "server.js"), [util.js](https://github.com/peers/peerjs-server/blob/master/lib/util.js "util.js"))がほぼそのまま動く。  
PackagedAppsの場合、SSLはオレオレ証明書で動かすしかなく、とりあえずコンセプトデモとして動かすことが優先なので、  
現時点ではSSLのパラメータについては無視して実装している。

###本家との差分
####server.js
1. 1行目から6行目までの、requireを削除
2. 52行目のinheritsを削除
3. 187行目のthis._app.postをthis._app.getにした。これは公式のサンプルページがgetを投げているためそれに合わせた。
4. exports.PeerServer = PeerServer;を削除

####util.js
1. module.exports = util;を削除(nodeじゃないので)

####peer.js
　単なるランチャーなのでそもそも利用せず。ここで指定しているパラメータは、どっかで指定できるようにしたい。そのうちやる。
