import mq from '../services/amqp/index.js';
import { logger } from '../utils/logger.js';

(async () => {
  logger.info('Sync MQ');
  await mq.sync();
  logger.info('Done');
})();
