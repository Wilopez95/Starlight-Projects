import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../../config.js';

/**
 *
 * @param {Redis.RedisOptions} options for redis client
 * @returns {Redis.Redis} client
 */
export const newClient = options => new Redis(parseInt(REDIS_PORT, 10), REDIS_HOST, options);

export const client = newClient({});
