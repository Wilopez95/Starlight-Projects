import { CacheKey, getCacheOf } from '../services/cache.js';
import { GLOBAL_SCHEMA_KEY } from '../config.js';
import { getScopedModels } from './getScopedModels.js';

const cachedModels = getCacheOf(CacheKey.MODELS);

export const getCachedModels = schemaName => {
  if (!cachedModels.has(schemaName)) {
    cachedModels.set(schemaName, getScopedModels(schemaName, GLOBAL_SCHEMA_KEY));
  }
  return cachedModels.get(schemaName);
};
