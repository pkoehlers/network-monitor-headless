export interface MessageReceiver {

registerMessageHandler(search: RegExp, callback: (msg: string, match: RegExpExecArray) => void): void;

}