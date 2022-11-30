import winston from "winston";


class Logger {
  static logger: winston.Logger;
  constructor() {

  }

  static info(message: string) {
    Logger.logger.info(message);
  }

  static error(message: string, error: Error) {
    Logger.logger.error(message, error);
  }

  static init() {
    if (!Logger.logger) {
      Logger.logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [
          new winston.transports.Console()
        ],
      });
    }
  }
}

Logger.init();

export default Logger;

