declare module 'ping-monitor' {
  import EventEmitter from "events";
    export interface MonitorOpts {
        website: string;
        address: string;
        title: string;
        interval: number;
        config: {
          intervalUnits: string
        };  
        httpOptions: {
          path: string,
          method: string
          query: any
          body: string
        };
        expect: {
          statusCode: number
        };
    }
    export class Monitor extends EventEmitter {

        constructor(opts:MonitorOpts);
        init(): any;
        setState(): any;
        mergeState(): any;
        getState(): any;
        start(): any;
        stop(): any;
        pause(): any;
        resume(): any;
        unpause(): any;
        restart(): any;
        clearInterval(): any;
        pingHTTP(): any;
        pingTCP(): any;
        respond(): any;
        down(): any;
        up(): any;
    }
}
