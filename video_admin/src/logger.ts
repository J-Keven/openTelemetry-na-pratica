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
        defaultMeta: { service: 'video_admin' },
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: 'error.log', level: 'error' }),
          new winston.transports.File({ filename: 'log.log', level: 'info' }),
        ],
      });
    }
  }
}

Logger.init();

export default Logger;

