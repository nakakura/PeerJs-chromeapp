///<reference path="./http/http.ts"/>
///<reference path="./jquery.d.ts"/>

//static class
class Util{
    static debug: boolean = false;

    static randomId(): string{
        return Math.random().toString(36).substr(2);
    }

    static prettyError(msg: string): void{
        if(Util.debug){
            console.log('ERROR PeerServer: ', msg);
        }
    }

    static log(...message: string[]): void{
        if(Util.debug){
            console.log.apply(console, message);
        }
    }

    static chompNull(array: string[]): string[]{
        function sub(counter: number, subArray: string[]): string[]{
            if(counter >= subArray.length) return subArray;
            else if(subArray[counter] === "") {
                subArray.splice(counter, 1);
                return sub(counter, subArray);
            } else{
                return sub(counter+1, subArray);
            }

            return subArray;
        }

        return sub(0, array);
    }

    static parseDir(path: string): string[]{
        var array = path.split("/");
        return Util.chompNull(array);
    }

    static targetParams(src: string): ParseTargetItem{
        var array = Util.parseDir(src);
        var keyArray: string[] = [];
        var counterArray: number[] = [];

        jQuery.each(array, function(i, item){
            if(item.indexOf(":") == 0){
                keyArray.push(item.substr(1));
                counterArray.push(i);
            }
        });

        return new ParseTargetItem(keyArray, counterArray);
    }

    static parseParams(src: string, targets: string[]): ParseTargetItem{
        var array = Util.parseDir(src);
        var keyArray: string[] = [];
        var counterArray: number[] = [];

        jQuery.each(array, function(i, item){
            if(item.indexOf(":") == 0){
                keyArray.push(item.substr(1));
                counterArray.push(i);
            }
        });

        return new ParseTargetItem(keyArray, counterArray);
    }

    static parseUrl(url: string): {[key: string]: string}{
        function parseItem(counter: number, itemArray: string[]): {[key: string]: string}{
            if(itemArray.length == 0 || counter >= itemArray.length) return {};

            var params: string[] = itemArray[counter].split("?");
            var hash: {[key:string]: string} = {};
            if(params.length == 2) hash[params[0]] = params[1];
            return jQuery.extend(hash, parseItem(counter + 1, itemArray));
        }

        var paramArray: string[] = url.split("=");
        return parseItem(0, paramArray);
    }


}

class ParseTargetItem{
    constructor(public targetKeys: string[], public targetPos: number[]){}
}

