import { MessageReceiver } from "./message-receiver";
import { MessageSender } from "./message-sender";
import { forkJoin } from "rxjs";

export class MessageDispatcher implements MessageSender, MessageReceiver {

    receivers: MessageReceiver[] = [];
    senders: MessageSender[] = [];

    sendMessage(msg: string): Promise<boolean> {
        const promises: Promise<boolean>[] = [];
        this.senders.forEach((sender) => promises.push(sender.sendMessage(msg)));
        return forkJoin(promises).toPromise().then((result: any) => {
            return true;
        });
    }
    registerMessageHandler(search: RegExp, callback: (msg: string, match: RegExpExecArray) => void): void {
        this.receivers.forEach((receiver) => receiver.registerMessageHandler(search, callback));
    }

    addReceiver(receiver:MessageReceiver): void {
        this.receivers.push(receiver);
    }
    addSender(sender:MessageSender): void {
        this.senders.push(sender);
    }
}