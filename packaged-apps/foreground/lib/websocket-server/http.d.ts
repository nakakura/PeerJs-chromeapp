/**
 * Created by nakakura on 3/31/14.
 */

declare module http{
    export class Server{
        public listen(port:number);
        public addEventListener(eventName: string, callback: (any)=>void);
    }
    export class WebSocketServer{
        constructor(server: Server);
        public addEventListener(eventName: string, callback: (any)=>void);
    }
}
