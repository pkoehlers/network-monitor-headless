import winston from "winston";

const options: winston.LoggerOptions = {
    transports: [
        new winston.transports.File({ filename: process.env.LOG_DIR || "./log" + "/monitors.log", level: "info"})
    ]
};

const monitorLogger = winston.createLogger(options);

export default monitorLogger;
