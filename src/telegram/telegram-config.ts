import { MessagingInterfaceConfig } from "../messaging/messaging-interface-config";

export interface TelegramConfig extends MessagingInterfaceConfig {
    botToken: string;
    chatId: number;
    pollingInterval: number;
    pollingTimeout: number;
}
