import { ConfigProvider } from "../config/config.provider";
import logger from "../util/logger";
import speedtestLogger from "../util/speedtest-logger";
import cron from "node-cron";

import speedTest from "speedtest-net";
import { MessageDispatcher } from "../messaging/message.dispatcher";

export class SpeedTestService {

    private configProvider: ConfigProvider;
    private messageDispatcher: MessageDispatcher;
    private task: cron.ScheduledTask;

    constructor(configProvider: ConfigProvider, messageDispatcher: MessageDispatcher) {
        this.configProvider = configProvider;
        this.messageDispatcher = messageDispatcher;

        this.messageDispatcher.registerMessageHandler(/\/speedtest/, this.messageHandlerSpeedtest);

        this.messageDispatcher.registerMessageHandler(/\/speedtest-schedule (.*)/, this.messageHandlerSchedule);
    }

    messageHandlerSpeedtest(ms: string, match: RegExpExecArray): void {
        this.messageDispatcher.sendMessage("starting manual speed test...");
        this.executeSpeedtest();
    }
    messageHandlerSchedule(ms: string, match: RegExpExecArray): void {
        try {
            this.setScheduledTest(match[1]);
            this.messageDispatcher.sendMessage("schedule saved");
        }
        catch (e) {
            logger.warn(e);
            this.messageDispatcher.sendMessage("error:" + e);
        }
        
    }

    executeSpeedtest(): void {
        speedTest({acceptGdpr: true, acceptLicense: true}).then(result => {
            logger.info("Speedtest finished successfully");
            speedtestLogger.info(result);
            this.messageDispatcher.sendMessage("Speedtest result: " 
                + "Download:" + (result.download.bandwidth * 8 / 1000000) + "MBit/s, "
                + "Upload:" + (result.upload.bandwidth * 8 / 1000000) + "MBit/s, "
                + "Ping:" + result.ping.latency + "ms "
                + "Server:" + result.server.host + "  Link: " + result.result.url);
            })
            .catch(error => this.handleError(error));
    }

    setScheduledTest(cronStr: string) {
        if (this.task !== undefined) {
            this.task.stop();
        }
        if (cronStr !== "stop")
        this.task = cron.schedule(cronStr, () =>  {
            this.executeSpeedtest();
        }); 
        this.configProvider.getConfig().speedtest.schedule = cronStr;
                      
        this.configProvider.writeConfig();

    }

    private handleError(error:any) {
        this.messageDispatcher.sendMessage("Speedtest FAILED: " + error);
        logger.error(error);
        speedtestLogger.error(error);
    }
}