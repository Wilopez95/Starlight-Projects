import getMemoryUsage from './getMemoryUsage.js';
import { logger } from './logger.js';

export default () => {
  Object.entries(getMemoryUsage()).forEach(([key, value]) => logger.info(`${key}: ${value}`));
};
