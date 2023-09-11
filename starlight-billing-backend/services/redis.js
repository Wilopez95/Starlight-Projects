import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config.js';

// TODO: lazy connect is necessary because otherwise scripts hang due to an open connection :(
// TODO: Find out why tokens.js is loaded (which is the reason this module is loaded)
export const client = new Redis(parseInt(REDIS_PORT, 10), REDIS_HOST, { lazyConnect: true });
