import winston from "winston";

const options: winston.LoggerOptions = {
    transports: [
        new winston.transports.File({ filename: process.env.LOG_DIR || "./log" + "/speedtests.log", level: "info"})
    ]
};

const speedtestLogger = winston.createLogger(options);

export default speedtestLogger;
