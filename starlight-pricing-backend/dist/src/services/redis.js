"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const Redis = require("ioredis");
const config_1 = require("../config/config");
// TODO: lazy connect is necessary because otherwise scripts hang due to an open connection :(
// TODO: Find out why tokens.js is loaded (which is the reason this module is loaded)
exports.client = new Redis(parseInt(config_1.REDIS_PORT ? config_1.REDIS_PORT : "6379", 10), config_1.REDIS_HOST, { lazyConnect: true });
//# sourceMappingURL=redis.js.map