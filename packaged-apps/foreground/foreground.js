$(function () {
    console.log("hogehoge");
    $("#start").click(function(){
        var key = $("#key")[0].value;
        var port = parseInt($("#port")[0].value, 10);
        var peer = PeerJsServer.getInstance(new PeerJsOptions(key, port));
        $("#start").hide();
    });

});


//# sourceMappingURL=foreground.js.map
