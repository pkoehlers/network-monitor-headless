import { Config } from "./config";
import { ConfigProvider } from "./config.provider";
import fs from "fs";

export class ConfigJsonProvider implements ConfigProvider {
    config: Config;

    loadConfig(): Config {
        const fileContent = fs.readFileSync(process.env.CONFIG_FILE, "utf8");
        const config: Config = JSON.parse(fileContent);
        return config;
    }

    getConfig(): Config {
        if (this.config === undefined) {
            this.config = this.loadConfig();
        }
        return this.config;
    }
    writeConfig(): void {
        const data = JSON.stringify(this.config, null, 2);
        fs.writeFileSync(process.env.CONFIG_FILE, data);
    }
}