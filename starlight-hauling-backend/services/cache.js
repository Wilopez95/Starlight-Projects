import NodeCache from 'node-cache';

export const CACHE_MAP = {
  ES_INSTANCES: 'initiated_es_instances',
  TABLE_COLUMNS: 'tables_columns',
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
      case CACHE_MAP.ES_INSTANCES: {
        cache[namespace] = new NodeCache({ ...defaultSettings, useClones: false });
        break;
      }
      case CACHE_MAP.TABLE_COLUMNS: {
        cache[namespace] = new NodeCache({ ...defaultSettings, useClones: false });
        break;
      }
      case CACHE_MAP.USERS: {
        cache[namespace] = new NodeCache(defaultSettings);
        break;
      }
      default: {
        break;
      }
    }
  }
  return cache[namespace] ?? null;
};

export const clearCacheInstances = () => {
  Object.values(cache).forEach(value => value.flushAll());
  cache = {};
};
