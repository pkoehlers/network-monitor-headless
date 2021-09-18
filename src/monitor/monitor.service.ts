import { MonitorOpts, Monitor } from "ping-monitor";
import { ConfigProvider } from "../config/config.provider";
import { MessageDispatcher } from "../messaging/message.dispatcher";

import logger from "../util/logger";
import monitorLogger from "../util/monitor-logger";

const MonitorType = require("ping-monitor");

export class MonitorService {

    private configProvider: ConfigProvider;
    private configs: MonitorOpts[];
    private monitors: Monitor[] = [];
    private messageDispatcher: MessageDispatcher;

    constructor(configProvider: ConfigProvider, messageDispatcher: MessageDispatcher) {
        this.messageDispatcher = messageDispatcher;
        this.configProvider = configProvider;
        this.configs = configProvider.getConfig().pingMonitors;

        this.init();
    }

    initMonitors(): void {
        this.configs.forEach(config => this.monitors.push(this.initMonitor(config)));
    }
    init(): void {
        this.initMonitors();
        this.messageDispatcher.registerMessageHandler(/\/monitor-interval (all|\d+) (\d+)/, (msg, match) => {
            this.messageDispatcher.sendMessage("starting interval update...");
            const newInterval: number = parseInt(match[2]);
            if (newInterval === null) {
                this.messageDispatcher.sendMessage("invalid arguments");
                return;
            }
            if (match[1] === "all") {
                this.monitors.forEach(monitor => monitor.stop());
                this.configs.forEach(config => config.interval = newInterval);
                this.monitors = [];
                this.initMonitors();
            } else {
                const matchIndex: number = parseInt(match[1]);
                const monitor: Monitor = this.monitors[matchIndex];
                this.configs[matchIndex].interval = newInterval;
                monitor.stop();
                this.monitors[matchIndex] = this.initMonitor(this.configs[matchIndex]);
            }
            
            this.configProvider.writeConfig();
            
        });
    }
    initMonitor(config: MonitorOpts): Monitor {
        const monitor: Monitor = new MonitorType(config);
        this.messageDispatcher.sendMessage("started monitor " + this.getTargetResolver(config)(config));
        this.addHandlers(monitor, this.getTargetResolver(config));

        return monitor;
    }

    addHandlers(monitor: Monitor, targetResolver: (response: any) => string): void {
        const messageDispatcher = this.messageDispatcher;    
        monitor.on("up", function (response, state) {
            logger.info(targetResolver(response) + " is up");
            monitorLogger.info(state);
            messageDispatcher.sendMessage(targetResolver(response) + " is up");
        });
        monitor.on("down", function (response, state) {
            logger.warn(targetResolver(response) + " is down");
            monitorLogger.info(state);
            messageDispatcher.sendMessage(targetResolver(response) + " is down");
        });

        monitor.on("stop", function (response, state) {
            logger.info(targetResolver(response) + " monitor stopped");
            messageDispatcher.sendMessage(targetResolver(response) + " monitor stopped");
        });
        ["error","timeout"].forEach(failureEvent => {
            monitor.on(failureEvent, function (response, state) {
                logger.info(targetResolver(response) + " monitor stopped");
                messageDispatcher.sendMessage(targetResolver(response) + " monitor stopped");
            });
        });

    }
    getTargetResolver(config: MonitorOpts) {
        return config.website !== undefined ? this.getTargetForHttp : this.getTargetForTcp;
    }
    getTargetForTcp(response: any): string {
        return response.address;
    }
    getTargetForHttp(response: any): string {
        return response.website;
    }
}