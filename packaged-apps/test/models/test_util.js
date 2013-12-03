
describe('debug', function(){
    it('M-SEARCHメッセージの作成', function(){
        ParseUri.debug = true;
        expect(ParseUri.debug).toBe(true);
    });

    it('urlのsplit', function(){
        ParseUri.parseDir("/hoge/:moge/:dir");
        //expect(ParseUri.debug).toBe(["hoge", ":moge", ":dir"]);
    });

    it('chompNull 空文字が中央にある場合', function(){
        expect(ParseUri.chompNull(["hoge", "", "moge"])).toEqual(["hoge", "moge"]);
    });

    it('chompNull 空文字が先頭にある場合', function(){
        expect(ParseUri.chompNull(["", "hoge", "moge"])).toEqual(["hoge", "moge"]);
    });

    it('chompNull 空文字が最後にある場合', function(){
        expect(ParseUri.chompNull(["hoge", "moge", ""])).toEqual(["hoge", "moge"]);
    });

    it('chompNull 空文字がない場合', function(){
        expect(ParseUri.chompNull(["hoge", "test", "moge"])).toEqual(["hoge", "test", "moge"]);
    });

    it('parsedir空文字あり', function(){
        expect(ParseUri.parseDir("/hoge//foo/bar")).toEqual(["hoge", "foo", "bar"]);
    });

    it('parsedir空文字なし', function(){
        expect(ParseUri.parseDir("/hoge/moge/foo/bar")).toEqual(["hoge", "moge", "foo", "bar"]);
    });

    it('parsedirコロンあり', function(){
        expect(ParseUri.parseDir("/hoge/:moge/foo/bar")).toEqual(["hoge", ":moge", "foo", "bar"]);
    });

    it('targetParams コロンあり', function(){
        var item = new ParseTargetItem(["hoge", ":moge", "foo", "bar"], ["moge"], [1]);
        item.srcPath = "/hoge/:moge/foo/bar";
        expect(ParseUri.targetParams("/hoge/:moge/foo/bar")).toEqual(item);
    });

    it('targetParams 複数', function(){
        var item = new ParseTargetItem([":hoge", ":moge", "foo", ":bar"], ["hoge", "moge", "bar"], [0, 1, 3]);
        item.srcPath = "/:hoge/:moge/foo/:bar";
        expect(ParseUri.targetParams("/:hoge/:moge/foo/:bar")).toEqual(item);
    });

    it('targetParams コロンなし', function(){
        var item = new ParseTargetItem(["hoge", "moge", "foo", "bar"], [], []);
        item.srcPath = "/hoge/moge/foo/bar";
        expect(ParseUri.targetParams("/hoge/moge/foo/bar")).toEqual(item);
    });

    it('isMatchParams コロンなし', function(){
        var targetItem = ParseUri.targetParams("/hoge/moge/foo/bar");
        expect(ParseUri.isMatchParams("/hoge/moge/foo/bar", targetItem)).toEqual(true);
    });

    it('isMatchParams コロンあり', function(){
        var targetItem = ParseUri.targetParams("/:hoge/:moge/:foo/bar");
        expect(ParseUri.isMatchParams("/:hoge/:moge/:foo/bar", targetItem)).toEqual(true);
    });

    it('parseParams', function(){
        var item = ParseUri.targetParams("/:hoge/:moge/:foo/bar");
        var ans = {"hoge": "hoge", "moge": "moge", "foo": "foo"};
        expect(ParseUri.parseParams("/hoge/moge/foo/bar", item)).toEqual(ans);
    });

    it('matchParseItem コロンあり', function(){
        var targetItemArray = [];
        targetItemArray.push(ParseUri.targetParams("/:hoge/:moge/foo"));
        targetItemArray.push(ParseUri.targetParams("/:hoge/:moge/:foo/bar"));
        targetItemArray.push(ParseUri.targetParams("/:hoge/:moge/:foo/:bar/poyo"));
        var item = ParseUri.matchParseItem("/hoge/moge/foo/bar/poyo", targetItemArray);
        var params = ParseUri.parseParams("/hoge/moge/foo/bar/poyo", item);
        var ans = {"hoge": "hoge", "moge": "moge", "foo": "foo", "bar": "bar"};
        expect(params).toEqual(ans);
    });

    it('parseUrl', function(){
        var hoge = ParseUri.parseUrl("/peerjs?key=peerjs&id=ReceiverID&token=5sguaz9c9fiuow29");
        var ans = {"key":"peerjs","id":"ReceiverID","token":"5sguaz9c9fiuow29"};
        expect(hoge).toEqual(ans);
    });
});
