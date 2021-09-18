import { format } from "winston";
import winston from "winston";

function createLogger() {
    const options: winston.LoggerOptions = {
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new winston.transports.Console({
                level: process.env.NODE_ENV === "production" ? "error" : "debug"
            }),
            new winston.transports.File({ filename: process.env.LOG_DIR || "./log" + "/app.log", level: process.env.NODE_ENV === "production" ? "info" : "debug" })
        ]
    };
    
    return winston.createLogger(options);
}
const logger = createLogger();

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level");
}

export default logger;
