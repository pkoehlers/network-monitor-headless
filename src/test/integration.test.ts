jest.mock("speedtest-net");

import speedTest, { ResultEvent } from "speedtest-net";
import fs from "fs";
import path from "path";
import os from "os";
import nock from "nock";
import { ConfigJsonProvider } from "../config/config-json.provider";
import { Config } from "../config/config";
import { App } from "../app";
import { TelegramConfig } from "../telegram/telegram-config";
import { TelegramStubService } from "../telegram/telegram-stub.service";
import { mocked } from "ts-jest/utils";


jest.setTimeout(203000);

describe("integration tests", () => {
    let tmpFolder: string;

    beforeEach(() => {
        jest.clearAllMocks();

        const testFileFolder: string = "./test";
        tmpFolder = fs.mkdtempSync(path.join(os.tmpdir(), "networkmonitor"));
        const testFiles: string[] = fs.readdirSync(testFileFolder);
        testFiles.forEach(file => {
            if (file !== ".DS_Store") {
                fs.copyFileSync(path.join(testFileFolder, file), path.join(tmpFolder, file));
            }
            
        });
        
        fs.mkdirSync(path.join(tmpFolder, "log"));
    });
    it("everything up and running", async () => {
        /*process.env.CONFIG_FILE = tmpFolder + '/config-integ-telegram-client.json';
        const clientTelegramConfig: Config = new ConfigJsonProvider().getConfig();*/
        process.env.CONFIG_FILE = tmpFolder + "/config-integ.json";
        process.env.LOG_DIR = tmpFolder + "/log";
        
        const testConfig: Config = new ConfigJsonProvider().getConfig();

        mockSpeedTest();

        const clientTelegramService: TelegramStubService = new TelegramStubService(testConfig.messaging[0] as TelegramConfig);

        const scopeHttp = nock(testConfig.pingMonitors[0].website)
            .persist()
            .get("/")
            .reply(200, {});

        const nockMessageSend = clientTelegramService.mockUpdateNoMessageSend();

        const now = new Date();
        clientTelegramService.mockMessageSend(["/help", "/chatid", "/speedtest-schedule some-invalid", 
            "/speedtest-schedule " + now.getSeconds() + " " + now.getMinutes() + " * * * *", "/monitor-interval all 4",
            "/monitor-interval 0 6", "/speedtest"]);


        new App();

        await delay(950);

        clientTelegramService.chatIdReceived.isDone();

        clientTelegramService.helpReceived.isDone();

        clientTelegramService.startupMessageReceived.isDone();
        
        clientTelegramService.shutdownMessageReceived.isDone();
        
        clientTelegramService.receivedSpeedTestResults.isDone();
        
        clientTelegramService.receivedSpeedTestErrors.isDone();
        
        clientTelegramService.scheduleSuccessReceived.isDone();
        clientTelegramService.scheduleErrorReceived.isDone();
        
        clientTelegramService.httpMonitorUpReceived.isDone();
        clientTelegramService.httpMonitorDownReceived.isDone();
        clientTelegramService.httpMonitorStartedReceived.isDone();
        clientTelegramService.httpMonitorStoppedReceived.isDone();

        clientTelegramService.telegramPollingErrorReceived.isDone();


        scopeHttp.isDone();
    });
    it("monitors breaking, speedtest errors", async () => {
        /*process.env.CONFIG_FILE = tmpFolder + '/config-integ-telegram-client.json';
        const clientTelegramConfig: Config = new ConfigJsonProvider().getConfig();*/
        process.env.CONFIG_FILE = tmpFolder + "/config-integ.json";
        process.env.LOG_DIR = tmpFolder + "/log";
        
        const testConfig: Config = new ConfigJsonProvider().getConfig();

        mockSpeedTest();

        const clientTelegramService: TelegramStubService = new TelegramStubService(testConfig.messaging[0] as TelegramConfig);

        const scopeHttp = nock(testConfig.pingMonitors[0].website)
            .persist()
            .get("/")
            .reply(400, {});

        const nockMessageSend = clientTelegramService.mockUpdateNoMessageSend();

        const now = new Date();
        clientTelegramService.mockMessageSend(["/help", "/chatid", "/schedule some-invalid", 
            "/schedule " + now.getSeconds() + " " + now.getMinutes() + " * * * *", "/monitor-interval all 4",
            "/monitor-interval 0 6", "/speedtest"]);


        new App();

        await delay(950);

        clientTelegramService.chatIdReceived.isDone();

        clientTelegramService.helpReceived.isDone();

        clientTelegramService.startupMessageReceived.isDone();
        
        clientTelegramService.shutdownMessageReceived.isDone();
        
        clientTelegramService.receivedSpeedTestResults.isDone();
        
        clientTelegramService.receivedSpeedTestErrors.isDone();
        
        clientTelegramService.scheduleSuccessReceived.isDone();
        clientTelegramService.scheduleErrorReceived.isDone();
        
        clientTelegramService.httpMonitorUpReceived.isDone();
        clientTelegramService.httpMonitorDownReceived.isDone();
        clientTelegramService.httpMonitorStartedReceived.isDone();
        clientTelegramService.httpMonitorStoppedReceived.isDone();

        clientTelegramService.telegramPollingErrorReceived.isDone();


        scopeHttp.isDone();
    });
});



function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

function mockSpeedTest() {
        
        
    const mockSpeedTest = mocked(speedTest);

    const testResult: ResultEvent = {
        download: {
            bandwidth: 100 / 8 * 1000000,
            bytes: 150 * 1000000,
            elapsed: 1500
        },
        upload: {
            bandwidth: 50 / 8 * 1000000,
            bytes: 160 * 1000000,
            elapsed: 1600
        
        },
        ping: {
            jitter: 23,
            latency: 45
        },
        server: {
            country: "country",
            host: "host",
            id: 1234567,
            ip: "ip",
            location: "location",
            name: "name",
            port: 1234
        },
        result: {
            id: "id",
            url: "url"
        },
        timestamp: new Date(),
        type: "result",
        isp: "isp",
        packetLoss: 1,
        interface: {
            externalIp: "externalIp",
            internalIp: "internalIp",
            isVpn: false,
            macAddr: "macAddr",
            name: "name"
        }
    };

    mockSpeedTest.mockReturnValue(Promise.resolve(testResult));
}
function mockSpeedTestError() { 
    const mockSpeedTest = mocked(speedTest);
    mockSpeedTest.mockReturnValue(Promise.reject("some error"));
}

