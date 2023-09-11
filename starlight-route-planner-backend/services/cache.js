import isNil from 'lodash/isNil.js';
import NodeCache from 'node-cache';

export const CacheKey = {
  MODELS: 'tenant_models',
};
const cacheForKey = '_cacheFor';

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
      default:
        return null;
    }
  }
  return cache[namespace];
};

export const clearCacheInstances = () => {
  Object.entries(cache).forEach(([ns, value]) => ns !== cacheForKey && value.flushAll());
  cache = {};
};

export const getCacheFabric = namespace => userId => {
  const hasStaleCache = !isNil(userId) && cache[cacheForKey] !== userId;

  if (isNil(cache[cacheForKey])) {
    cache[cacheForKey] = userId;
  }

  if (hasStaleCache) {
    clearCacheInstances();
    cache[cacheForKey] = userId;
  }

  if (!cache[namespace]) {
    switch (namespace) {
      case CacheKey.MODELS: {
        cache[namespace] = new NodeCache(defaultSettings);
        break;
      }
      default:
        return null;
    }
  }
  return cache[namespace];
};
