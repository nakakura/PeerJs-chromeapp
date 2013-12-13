///<reference path="./http.ts"/>
///<reference path="./jquery.d.ts"/>

class ParseUri{
    static chompNull(array: string[]): string[]{
        function sub(counter: number, subArray: string[]): string[]{
            if(counter >= subArray.length) return subArray;
            else if(subArray[counter] === "") {
                subArray.splice(counter, 1);
                return sub(counter, subArray);
            } else{
                return sub(counter+1, subArray);
            }
        }

        return sub(0, array);
    }

    static parseDir(path: string): string[]{
        var array = path.split("/");
        return ParseUri.chompNull(array);
    }

    static targetParams(src: string): ParseTargetItem{
        var array = ParseUri.parseDir(src);
        var keyArray: string[] = [];
        var counterArray: number[] = [];

        jQuery.each(array, function(i, item){
            if(item.indexOf(":") == 0){
                keyArray.push(item.substr(1));
                counterArray.push(i);
            }
        });

        var item = new ParseTargetItem(array, keyArray, counterArray)
        item.srcPath = src;
        return item;
    }

    static isMatchParams(src: string, target: ParseTargetItem): boolean{
        var array = ParseUri.parseDir(src);
        if(array.length != target.srcParams.length) return false;
        else if(array[array.length - 1].indexOf(target.method()) !== 0) return false;
        return true;
    }

    static parseParams(src: string, target: ParseTargetItem): {[key: string]: string}{
        var array = ParseUri.parseDir(src);
        var retHash: {[key: string]: string} = {};
        jQuery.each(target.targetPos, function(i, item){
            retHash[target.targetKeys[i]] = array[item];
        });
        return retHash;
    }

    static matchParseItem(src: string, targets: ParseTargetItem[]): ParseTargetItem{
        function subParseParams(counter: number, src: string, targets: ParseTargetItem[]): ParseTargetItem{
            if(counter >= targets.length) return null;
            else if(ParseUri.isMatchParams(src, targets[counter])){
                return targets[counter];
            }
            return subParseParams(counter + 1, src, targets);
        }

        return subParseParams(0, src, targets);
    }

    static parseUrl(url: string): {[key: string]: string}{
        function parseItem(counter: number, itemArray: string[]): {[key: string]: string}{
            if(itemArray.length == 0 || counter >= itemArray.length) return {};

            var params: string[] = itemArray[counter].split("=");
            var hash: {[key:string]: string} = {};
            if(params.length == 2) hash[params[0]] = params[1];
            return jQuery.extend(hash, parseItem(counter + 1, itemArray));
        }

        var params: string[] = url.split("?");
        var paramArray: string[] = params[1].split("&");
        return parseItem(0, paramArray);
    }
}

class ParseTargetItem{
    public srcPath: string;

    constructor(public srcParams: string[], public targetKeys: string[], public targetPos: number[]){}
    public method(): string{
        return this.srcParams[this.srcParams.length - 1];
    }
}
