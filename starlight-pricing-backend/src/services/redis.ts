import * as Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config/config';

// TODO: lazy connect is necessary because otherwise scripts hang due to an open connection :(
// TODO: Find out why tokens.js is loaded (which is the reason this module is loaded)
export const client = new Redis(parseInt(REDIS_PORT ? REDIS_PORT : '6379', 10), REDIS_HOST, {
  lazyConnect: true,
});
