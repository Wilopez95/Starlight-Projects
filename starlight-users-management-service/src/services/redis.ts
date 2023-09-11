import Redis from 'ioredis';

import { REDIS_URL } from '../config';

export const redisClient = new Redis(REDIS_URL);
