import NodeCache from 'node-cache';

export const CacheKey = {
  MODELS: 'tenant_models',
  FLUIDPAY: 'fluid_pay',
  USERS: 'users',
};

const defaultSettings = {
  stdTTL: 0,
  checkperiod: 0,
};

let cache = {};
export const getCacheOf = namespace => {
  if (!cache[namespace]) {
    switch (namespace) {
      case CacheKey.MODELS: {
        cache[namespace] = new NodeCache(defaultSettings);
        break;
      }
      case CacheKey.FLUIDPAY: {
        cache[namespace] = new NodeCache(defaultSettings);
        break;
      }
      case CacheKey.USERS: {
        cache[namespace] = new NodeCache(defaultSettings);
        break;
      }
      default:
        return null;
    }
  }
  return cache[namespace];
};

export const clearCacheInstances = () => {
  Object.values(cache).forEach(value => value.flushAll());
  cache = {};
};
