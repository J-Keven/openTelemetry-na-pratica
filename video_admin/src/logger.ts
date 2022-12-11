import winston from "winston";
import WinstonLoki from "winston-loki"

class Logger {
  static logger: winston.Logger;
  constructor() {

  }

  static info(message: string, value?: any) {
    if (typeof value !== 'object') {
      value = JSON.stringify(value);
    }
    Logger.logger.log({
      level: 'info',
      message,
      value,
    });
  }

  static error(message: string, status?: number, error?: any) {
    Logger.logger.log({
      level: 'error',
      message,
      status,
      error
    });
  }

  static init() {
    if (!Logger.logger) {
      const logFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, value, app, service, status }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            value,
            app,
            service,
            status
          })
        })
      );

      Logger.logger = winston.createLogger({
        level: 'info',
        defaultMeta: { service: 'video_admin' },
        transports: [
          new winston.transports.Console(),
          // new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
          // new winston.transports.File({ filename: './logs/log.log', level: 'info' }),
          new WinstonLoki({
            host: 'http://loki:3100',
            format: logFormat,
            labels: {
              app: 'video_admin'
            }
          })
        ],
      });

      Logger.logger.format = logFormat

    }
  }
}

Logger.init();

export default Logger;

