import httpStatus from 'http-status';

import { clearCacheInstances } from '../../../../services/cache.js';

export const clearCache = ctx => {
  clearCacheInstances();
  ctx.status = httpStatus.NO_CONTENT;
};
