describe('ParseURI', function() {
    //一致するケース シングル 変数なし
    it('#match case 1', function() {
        var matcher = new App.URIMatcher("/hoge");
        var hash = {};
        var isMatch = matcher.match("/hoge", hash);
        expect(isMatch).to.be.equal(true);
        expect(hash).to.eql({});
    });

    //一致するケース　シングル　変数あり
    it('#match case 2', function() {
        var matcher = new App.URIMatcher("/:hoge");
        var hash = {};
        var isMatch = matcher.match("/hoge", hash);
        expect(isMatch).to.be.equal(true);
        expect(hash).to.eql({hoge: "hoge"});
    });

    //一致するケース ダブル 変数なし
    it('#match case 3', function() {
        var matcher = new App.URIMatcher("/hoge/moge");
        var hash = {};
        var isMatch = matcher.match("/hoge/moge", hash);
        expect(isMatch).to.be.equal(true);
        expect(hash).to.eql({});
    });

    //一致するケース ダブル 変数あり
    it('#match case 4', function() {
        var matcher = new App.URIMatcher("/:hoge/moge");
        var hash = {};
        var isMatch = matcher.match("/fuga/moge", hash);
        expect(isMatch).to.be.equal(true);
        expect(hash).to.eql({hoge: "fuga"});
    });

    //一致するケース 多数 変数なし
    it('#match case 5', function() {
        var matcher = new App.URIMatcher("/hoge/moge/foo/bar/ttt/aaa/bbb/ccc");
        var hash = {};
        var isMatch = matcher.match("/hoge/moge/foo/bar/ttt/aaa/bbb/ccc", hash);
        expect(isMatch).to.be.equal(true);
        expect(hash).to.eql({});
    });

    //一致するケース 多数 変数多数
    it('#match case 6', function() {
        var matcher = new App.URIMatcher("/:hoge/:moge/:foo/:bar/:ttt/:aaa/:bbb/ccc");
        var hash = {};
        var isMatch = matcher.match("/fuga/hoge/sss/ddd/fff/ggg/eeee/ccc", hash);
        expect(isMatch).to.be.equal(true);
        expect(hash).to.eql({hoge: "fuga", moge: "hoge", foo: "sss", bar: "ddd", ttt: "fff", aaa: "ggg", bbb: "eeee"});
    });

    //一致しないケース 末尾違い
    it('#match case 7', function() {
        var matcher = new App.URIMatcher("/:hoge/:moge/:foo/:bar/:ttt/:aaa/:bbb/ccc");
        var hash = {};
        var isMatch = matcher.match("/fuga/hoge/sss/ddd/fff/ggg/eeee/aaa", hash);
        expect(isMatch).to.be.equal(false);
        expect(hash).to.eql({});
    });

    //一致しないケース 途中違い
    it('#match case 8', function() {
        var matcher = new App.URIMatcher("/hoge/moge/foo/bar/ttt/aaa/bbb/ccc");
        var hash = {};
        var isMatch = matcher.match("/hoge/moge/foo/br/ttt/aaa/bbb/ccc", hash);
        expect(isMatch).to.be.equal(false);
        expect(hash).to.eql({});
    });

    //複数ケースからの選別
    it('#match case 9', function() {
        var matcher1 = new App.URIMatcher("/:aaa/id");
        var matcher2 = new App.URIMatcher("/:aaa/:bbb/id");
        var url = "/aaa/bbb/id"
        var isMatch1 = matcher1.test(url);
        var isMatch2 = matcher2.test(url);
        expect(isMatch1).to.be.equal(false);
        expect(isMatch2).to.be.equal(true);
    });
});

