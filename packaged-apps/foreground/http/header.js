//static class
var Header = (function () {
    function Header(_headerString) {
        this._headerString = _headerString;
    }
    Header.prototype.allowCrossDomain = function () {
        this.setHeader('Access-Control-Allow-Origin', '*');
        this.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        this.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    };

    Header.prototype.setHeader = function (method, value) {
        this._headerString += method + ": " + value + "\r\n";
    };

    Header.prototype.header = function () {
        return this._headerString;
    };
    return Header;
})();
//# sourceMappingURL=header.js.map
