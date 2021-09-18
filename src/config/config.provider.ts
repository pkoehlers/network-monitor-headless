import { Config } from "./config";

export interface ConfigProvider {
    getConfig(): Config;
    writeConfig(): void;
}