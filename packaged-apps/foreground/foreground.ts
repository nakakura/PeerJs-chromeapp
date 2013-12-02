///<reference path="./peerjs_server.ts"/>

declare var chrome;

var peer = new PeerJsServer(new PeerJsOptions());

/*
chrome.runtime.getBackgroundPage(function(bgPage) {
    if(bgPage.webSocketManager !== undefined){
        var socketId = bgPage.webSocketManager.socketId();
        chrome.socket.destroy(socketId);
    }

    bgPage.webSocketManager = new WebSocketManager(9999);
    bgPage.webSocketManager.removeAllObservers();
    bgPage.webSocketManager.startListening();

});
    */


