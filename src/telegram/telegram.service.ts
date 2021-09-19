import logger from "../util/logger";
import TelegramBot from "node-telegram-bot-api";
import { MessageSender } from "../messaging/message-sender";
import { MessageReceiver } from "../messaging/message-receiver";
import { TelegramConfig } from "./telegram-config";

export class TelegramService implements MessageSender, MessageReceiver {

    private config: TelegramConfig;
    private bot: TelegramBot;

    private msgQueue: string[] = [];

    constructor(config: TelegramConfig, bot?: TelegramBot) {
      this.config = config;
      if (bot !== undefined) {
        this.bot = bot;
      } else {
        this.bot = new TelegramBot(config.botToken, {polling: {autoStart: true, interval:config.pollingInterval, params:{timeout: config.pollingTimeout}}});
      }
      this.registerDefaultMessageHandlers();
      this.registerErrorMessageHandlers();
    }

    sendMessage(msg: string): Promise<boolean> {
      logger.debug("sending telegram message: " + msg);

      if (this.config.chatId === undefined || this.config.chatId === 0) {
        logger.warn("telegram chat id not sent. omitting message send");
        return Promise.resolve(false);
      }

      return this.bot.sendMessage(this.config.chatId, msg).then((telegramMsg) => {
        let msg: string;
        while ((msg = this.msgQueue.shift()) !== undefined) {
          this.bot.sendMessage(this.config.chatId, msg);
        }
        return true;
      }).catch(error => {
        logger.error("Could not send message: " + error);
        return false;
      });
    }

    registerDefaultMessageHandlers(): void {
      this.bot.onText(/\/chatid/, (msg, match) => {
      
        const chatId = msg.chat.id;
        const resp = "chat id is: " + chatId;
      
        this.bot.sendMessage(chatId, resp);
      });
      this.bot.onText(/\/help/, (msg, match) => {
      
        const chatId = msg.chat.id;
        let resp = "Usage: ";
        resp += "/chatid - responds with the id of the current chat";
        resp += "/speedtest-schedule <cron format> - sets the format to the supplied schedule. Format is: (second) minute hour 'day of month' month 'day of week'";
        resp += "/speedtest - manually trigger immediate execution of speedtest";
        resp += "/monitor-interval <monitor index | all> <interval> - change the interval config of one or all ping monitors";
        this.bot.sendMessage(chatId, resp);
      });

    }
    registerErrorMessageHandlers(): void {
      this.bot.on("polling_error", (error) => {
        logger.error("telegram polling_error: " + error.message);
        logger.error(error.stack);
        this.msgQueue.push("telegram polling_error: " + error.message);
      });
      this.bot.on("error", (error) => {
        logger.error("telegram error: " + error.message);
        logger.error(error.stack);
        this.msgQueue.push("telegram error: " + error.message);
      });
    }
    registerMessageHandler(search: RegExp, callback: (msg: string, match: RegExpExecArray) => void): void {
      this.bot.onText(search, (msg, match) => {
        logger.debug("received telegram message: " + msg.text);
        if (this.config.chatId === msg.chat.id) {
          callback(msg.text, match);
        } else {
          const errMsg: string = "received telegram message from unknown chat id: " + msg;
          logger.error(errMsg);
          logger.debug("received telegram message from unknown chat msg: " + msg);
          this.bot.sendMessage(this.config.chatId, errMsg);
        }

      });
  }
}