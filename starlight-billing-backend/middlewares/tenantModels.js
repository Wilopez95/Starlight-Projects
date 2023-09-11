import { getCachedModels } from '../utils/getCachedModels.js';
import { GLOBAL_SCHEMA_KEY } from '../config.js';

export const initTenantModels = async (ctx, next) => {
  const schemaName = ctx.state.user?.subscriberName ?? GLOBAL_SCHEMA_KEY;

  ctx.state.models = getCachedModels(schemaName);

  await next();
};
