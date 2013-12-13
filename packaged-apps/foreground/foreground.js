$(function () {
    console.log("hogehoge");
    $("#start").click(function(){
        var key = $("#key")[0].value;
        var port = parseInt($("#port")[0].value, 10);
        var peer = new PeerServer({
            port: 9000,
            timeout: 5000,
            key: 'peerjs'});// .getInstance(new PeerJsOptions(key, port));
        $("#start").hide();
    });

});


//# sourceMappingURL=foreground.js.map
