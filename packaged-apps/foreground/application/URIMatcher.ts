/**
 * Created by nakakura on 4/1/14.
 */

///<reference path="../lib/jquery/jquery.d.ts"/>

module App{
    export class URIMatcher{
        private _matchedParams: string[] = [];
        private _matcher: RegExp = null;
        private _urlPart = "([\\w:%#\\$&\\?\\(\\)~\\.=\\+\\-]+)";
        public sourceURL: string = '';

        constructor(matcherString: string){
            this.sourceURL = matcherString;
            this._createMatcher(matcherString);
        }

        private _createMatcher(matcherString: string){
            var regExpString = "^";
            var matcherItems = this._parseDir(matcherString);

            matcherItems.forEach((item)=>{
                if(item.indexOf(":") == 0) {
                    this._matchedParams.push(item.substring(1));
                    regExpString += "/" + this._urlPart;
                } else{
                    regExpString += "/" + item;
                }
            });

            regExpString += "$";

            this._matcher = new RegExp(regExpString);
        }

        private _chompNull(array: string[]): string[]{
            var _removeNull = (counter: number, subArray: string[]):string[] => {
                if(counter >= subArray.length) return subArray;
                else if(subArray[counter] === "") {
                    subArray.splice(counter, 1);
                    return _removeNull(counter, subArray);
                } else{
                    return _removeNull(counter+1, subArray);
                }
            }

            return _removeNull(0, array);
        }

        private _parseDir(path: string): string[]{
            var array = path.split("/");
            return this._chompNull(array);
        }

        public test(targetURI: string): boolean{
            return this._matcher.test(targetURI);
        }

        public match(url: string, retHash:{[key: string]: string}): boolean{
            var targetURI = url.split("?")[0];
            console.log("target " + targetURI);
            if(!this._matcher.test(targetURI)) return false;
            var matchedItems = this._matcher.exec(targetURI);

            for(var i = 0; i < this._matchedParams.length; i++){
                retHash[this._matchedParams[i]] = matchedItems[i+1];
            }

            var items = this._parseDir(targetURI);
            var fileName = items[items.length - 1];
            console.log(fileName);

            return true;
        }
    }
}
