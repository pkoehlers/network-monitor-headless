import dotenv from "dotenv";
import process from "process";

import { TelegramService } from "./telegram/telegram.service";
import { ConfigJsonProvider } from "./config/config-json.provider";
import { ConfigProvider } from "./config/config.provider";
import { SpeedTestService } from "./speedtest/speedtest.service";
import logger from "./util/logger";
import { MessageDispatcher } from "./messaging/message.dispatcher";
import { TelegramConfig } from "./telegram/telegram-config";
import { MonitorService } from "./monitor/monitor.service";

dotenv.config({ path: ".env" });

const configProvider: ConfigProvider = new ConfigJsonProvider();
const messageDispatcher: MessageDispatcher = new MessageDispatcher();

configProvider.getConfig().messaging.forEach(messagingConfig => {
    // Check for the interface type as soon as there are others than telegram
    const telegramService: TelegramService = new TelegramService(messagingConfig as TelegramConfig);
    messageDispatcher.addReceiver(telegramService);
    messageDispatcher.addSender(telegramService);
});

const speedTestService: SpeedTestService = new SpeedTestService(configProvider, messageDispatcher);
const monitorService: MonitorService = new MonitorService(configProvider, messageDispatcher);
messageDispatcher.sendMessage("speed test instance is online and awaiting commands 🚀");

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

let shuttingDown: boolean = false;
function shutdown() {
    if (!shuttingDown) {
        shuttingDown = true;
        messageDispatcher.sendMessage("Instance shutting down... 	🌚").then(() => {
            process.exit(0);
        }).catch((error) => {
            logger.error(error);
            process.exit(-1);
        });
    }
}