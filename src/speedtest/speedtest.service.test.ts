const logger = {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  };

  
jest.mock("speedtest-net");
jest.mock("../messaging/message.dispatcher");
jest.mock("node-cron");
jest.mock("../util/logger");
jest.mock("../util/speedtest-logger");
jest.mock("winston", () => ({
    format: {
      colorize: jest.fn(),
      combine: jest.fn(),
      label: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn(),
      json: jest.fn()
    },
    createLogger: jest.fn().mockReturnValue(logger),
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  }));

import { ConfigProvider } from "../config/config.provider";
import defLogger from "../util/logger";
import speedtestLogger from "../util/speedtest-logger";
import cron from "node-cron";

import speedTest, { ResultEvent } from "speedtest-net";
import { MessageDispatcher } from "../messaging/message.dispatcher";
import { SpeedTestService } from "./speedtest.service";
import { ConfigJsonProvider } from "../config/config-json.provider";

import { mocked } from "ts-jest/utils";
import exec from "speedtest-net";

describe("speedtest tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("constructor set up message handlers correctly", () => {
        process.env.CONFIG_FILE = "test/config-dummy.json";
        const tested: SpeedTestService = new SpeedTestService(new ConfigJsonProvider(), new MessageDispatcher());

        const mockMessageDispatcherInstance = mocked(MessageDispatcher).mock.instances[0];
        const mockRegisterMessageHandler = mockMessageDispatcherInstance.registerMessageHandler;
        expect(mocked(mockRegisterMessageHandler).mock.calls[0][0]).toEqual(/\/speedtest/);
        expect(mocked(mockRegisterMessageHandler).mock.calls[1][0]).toEqual(/\/speedtest-schedule (.*)/);
/*
        expect(mocked(mockRegisterMessageHandler).mock.calls[0][1]).toEqual(tested.messageHandlerSpeedtest);
        expect(mocked(mockRegisterMessageHandler).mock.calls[1][1]).toEqual(tested.messageHandlerSchedule);
*/
        expect(mockRegisterMessageHandler).toHaveBeenCalledTimes(2);
    });

    /*it("speedtest executed on manual command", () => {

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

        process.env.CONFIG_FILE = "test/config.json";
        const tested: SpeedTestService = new SpeedTestService(new ConfigJsonProvider(), new MessageDispatcher());
        //tested.messageHandlerSpeedtest("/schedule", [] as RegExpExecArray);


        const mockMessageDispatcherInstance = mocked(MessageDispatcher).mock.instances[0];
        const mockSendMessage = mockMessageDispatcherInstance.sendMessage;

        expect(mockSendMessage).toHaveBeenCalledTimes(1);

    });*/
});
