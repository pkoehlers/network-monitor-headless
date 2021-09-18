export interface MessageSender {
    sendMessage(msg: string): Promise<boolean>;
}

