import 'dotenv/config';
import './instrumentation';
import Database from './database';
import app from './express';
import logger from './logger';

(async () => {
  await Database.connect();
  logger.info('Database connected');
  app.listen(3333, () => {
    logger.info(`Server started on port ${3333}`)
  });
})();


