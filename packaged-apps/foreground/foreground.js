$(function () {
    console.log("hogehoge");
    $("#start").click(function(){
        var key = $("#key")[0].value;
        var port = parseInt($("#port")[0].value, 10);
        var peer = new PeerServer({
            port: port,
            timeout: 5000,
            key: key});// .getInstance(new PeerJsOptions(key, port));
        $("#start").hide();
    });

});


//# sourceMappingURL=foreground.js.map
