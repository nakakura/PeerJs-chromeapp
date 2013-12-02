
describe('debug', function(){
    it('M-SEARCHメッセージの作成', function(){
        Util.debug = true;
        expect(Util.debug).toBe(true);
    });

    it('urlのsplit', function(){
        Util.parseDir("/hoge/:moge/:dir");
        //expect(Util.debug).toBe(["hoge", ":moge", ":dir"]);
    });

    it('chompNull 空文字が中央にある場合', function(){
        expect(Util.chompNull(["hoge", "", "moge"])).toEqual(["hoge", "moge"]);
    });

    it('chompNull 空文字が先頭にある場合', function(){
        expect(Util.chompNull(["", "hoge", "moge"])).toEqual(["hoge", "moge"]);
    });

    it('chompNull 空文字が最後にある場合', function(){
        expect(Util.chompNull(["hoge", "moge", ""])).toEqual(["hoge", "moge"]);
    });

    it('chompNull 空文字がない場合', function(){
        expect(Util.chompNull(["hoge", "test", "moge"])).toEqual(["hoge", "test", "moge"]);
    });

    it('parsedir空文字あり', function(){
        expect(Util.parseDir("/hoge//foo/bar")).toEqual(["hoge", "foo", "bar"]);
    });

    it('parsedir空文字なし', function(){
        expect(Util.parseDir("/hoge/moge/foo/bar")).toEqual(["hoge", "moge", "foo", "bar"]);
    });

    it('parsedirコロンあり', function(){
        expect(Util.parseDir("/hoge/:moge/foo/bar")).toEqual(["hoge", ":moge", "foo", "bar"]);
    });

    it('targetParams コロンあり', function(){
        expect(Util.targetParams("/hoge/:moge/foo/bar")).toEqual(new ParseTargetItem(["moge"], [1]));
    });

    it('targetParams 複数', function(){
        expect(Util.targetParams("/:hoge/:moge/foo/:bar")).toEqual(new ParseTargetItem(["hoge", "moge", "bar"], [0, 1, 3]));
    });

    it('targetParams コロンなし', function(){
        expect(Util.targetParams("/hoge/moge/foo/bar")).toEqual(new ParseTargetItem([], []));
    });
});
