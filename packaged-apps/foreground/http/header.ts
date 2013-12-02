
//static class
class Header{
    constructor(private _headerString: string){

    }

    public allowCrossDomain(): void{
        this.setHeader('Access-Control-Allow-Origin', '*');
        this.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        this.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    public setHeader(method: string, value: string): void{
        this._headerString +=  method + ": " + value + "\r\n";
    }

    public header(): string{
        return this._headerString;
    }
}

