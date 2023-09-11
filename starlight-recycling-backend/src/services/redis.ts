import Redis from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config';

export const newClient = (options: Redis.RedisOptions): Redis.Redis =>
  new Redis(parseInt(REDIS_PORT), REDIS_HOST, options);

export const client = newClient({});
