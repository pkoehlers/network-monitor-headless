import { MonitorOpts } from "ping-monitor";
import { MessagingInterfaceConfig } from "../messaging/messaging-interface-config";

export interface Config {
    speedtest: {
        schedule: string
    };
    pingMonitors: MonitorOpts[];
    messaging: MessagingInterfaceConfig[];
}