import getMemoryUsage from './getMemoryUsage.js';
import { logger } from './logger.js';

export default p => {
  Object.entries(getMemoryUsage(p)).forEach(([key, value]) => logger.info(`${key}: ${value}`));
};
