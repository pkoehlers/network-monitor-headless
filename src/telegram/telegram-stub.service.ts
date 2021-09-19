import TelegramBot from "node-telegram-bot-api";
import { Config } from "../config/config";
import nock from "nock";
import { MessageReceiver } from "../messaging/message-receiver";
import { MessageSender } from "../messaging/message-sender";
import { TelegramConfig } from "./telegram-config";
import { TelegramService } from "./telegram.service";

export class TelegramStubService {

    private config: TelegramConfig;
    protected bot: TelegramBot;

    helpReceived: nock.Scope;

    chatIdReceived: nock.Scope;

    startupMessageReceived: nock.Scope;

    shutdownMessageReceived: nock.Scope;

    receivedSpeedTestStart: nock.Scope;
    receivedSpeedTestResults: nock.Scope;

    receivedSpeedTestErrors: nock.Scope;

    scheduleSuccessReceived: nock.Scope;
    scheduleErrorReceived: nock.Scope;

    httpMonitorIntervalChangeReceived: nock.Scope;
    httpMonitorUpReceived: nock.Scope;
    httpMonitorDownReceived: nock.Scope;
    httpMonitorStartedReceived: nock.Scope;
    httpMonitorStoppedReceived: nock.Scope;

    telegramPollingErrorReceived: nock.Scope;
/*
    tcpMonitorUpReceived: nock.Scope;
    tcpMonitorDownReceived: nock.Scope;
    tcpMonitorStartedReceived: nock.Scope;
    tcpMonitorStoppedReceived: nock.Scope;
*/
    constructor(config: TelegramConfig) {
        this.config = config;
        this.bot = new TelegramBot(config.botToken, {polling: {autoStart: true, interval:config.pollingInterval, params:{timeout: config.pollingTimeout}}});
        this.registerAssertionHandlers();
    }

    registerAssertionHandlers() {
        this.helpReceived = this.mockMessageReceived("Usage.*");

        this.chatIdReceived = this.mockMessageReceived("chat id is.*");

        this.startupMessageReceived = this.mockMessageReceived("instance is online.*");
        
        this.shutdownMessageReceived = this.mockMessageReceived("instance shutting down.*");
        
        
        this.receivedSpeedTestStart = this.mockMessageReceived("starting manual speed test...");
        this.receivedSpeedTestResults = this.mockMessageReceived("Speedtest result(.*)");
        
        this.receivedSpeedTestErrors = this.mockMessageReceived("Speedtest FAILED(.*)");
        
        this.scheduleSuccessReceived = this.mockMessageReceived("schedule saved");
        this.scheduleErrorReceived = this.mockMessageReceived("schedule could not be saved(.*)");
        
        this.httpMonitorIntervalChangeReceived = this.mockMessageReceived("starting interval update...");
        this.httpMonitorUpReceived = this.mockMessageReceived("https.* is up");
        this.httpMonitorDownReceived = this.mockMessageReceived("https.* is down");
        this.httpMonitorStartedReceived = this.mockMessageReceived("started monitor https.*");
        this.httpMonitorStoppedReceived = this.mockMessageReceived("https.* monitor stopped");

        this.telegramPollingErrorReceived = this.mockMessageReceived("telegram polling_error.*");
        
    }
    mockUpdateNoMessageSend() {
        return nock("https://api.telegram.org")
        .post("/bot" + this.config.botToken  + "/getUpdates", "timeout=4&offset=0")
        .reply(200, {
            "result": [
            ],
            "ok":true
        });
    }

    mockMessageSend(msgs: string[]) {
        const messages: any[] = [];
        msgs.forEach((msg) => {
            messages.push(this.mockMessage(msg));
        });

        return nock("https://api.telegram.org")
        .post("/bot" + this.config.botToken  + "/getUpdates", /timeout=4&offset=.*/)
        .reply(200, {
            "result": messages,
            "ok":true
        });
    }
    mockMessage(msg: string) {
        return {
            "update_id": this.getRandom(50000000,60000000),
            "message": {
                "message_id": this.getRandom(0,200),
                "from": {
                    "id": this.getRandom(800000000,900000000),
                    "is_bot": false,
                    "first_name": "Testuser",
                    "language_code": "de"
                },
                "chat": {
                    "id": this.config.chatId,
                    "title": "Some title",
                    "type": "group",
                    "all_members_are_administrators": true
                },
                "date": 1632023534,
                "text": msg
            }
        };

    }
    mockMessageReceived(msg: string) {
        return nock("https://api.telegram.org")
        .persist()
        .post("/bot" + this.config.botToken  + "/sendMessage", new RegExp("chat_id=" + this.config.chatId + "&text=" + encodeURI(msg)))
        .reply(200, {
            "ok": true,
            "result": [
                {
                    "ok": true,
                    "result": {
                        "message_id": this.getRandom(0,200),
                        "from": {
                            "id": this.getRandom(2000000000,3000000000),
                            "is_bot": true,
                            "first_name": "Test",
                            "username": "test"
                        },
                        "chat": {
                            "id": this.config.chatId,
                            "title": "Network Monitor Int",
                            "type": "group",
                            "all_members_are_administrators": true
                        },
                        "date": 1632024179,
                        "text": "test"
                    }
                }
                
            ]
        });
    }
    

  private getRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}