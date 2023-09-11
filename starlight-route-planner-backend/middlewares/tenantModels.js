import { getCacheFabric, CacheKey } from '../services/cache.js';

import { getScopedContextModels } from '../utils/getScopedModels.js';

const getCacheFor = getCacheFabric(CacheKey.MODELS);

const GLOBAL_SCHEMA_KEY = 'global';

export const initTenantModels = async (ctx, next) => {
  const schemaName = ctx.state.user?.subscriberName ?? GLOBAL_SCHEMA_KEY;

  const cachedModels = getCacheFor(ctx.state.user?.id);

  if (!cachedModels.has(schemaName)) {
    cachedModels.set(schemaName, getScopedContextModels(ctx, GLOBAL_SCHEMA_KEY));
  }

  ctx.state.models = cachedModels.get(schemaName);

  await next();
};
