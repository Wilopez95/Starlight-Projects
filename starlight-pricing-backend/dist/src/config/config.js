"use strict";
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRACING_PARAM = exports.TRACING_HEADER = exports.LOGGING_REMOVE = exports.LOGGING_HIDE = exports.PRETTY_LOGS = exports.LIGHT_LOGS = exports.SLOW_REQUEST_TIMEOUT = exports.LOG_LEVEL = exports.APP_NAME = exports.NODE_ENV = exports.AUDIT_LOGS_ELASTIC_PORT = exports.AUDIT_LOGS_ELASTIC_URL = exports.ELASTIC_PORT = exports.ELASTIC_URL = exports.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS = exports.AMQP_SKIP_SETUP = exports.AMQP_UPDATE_COMPANY_QUEUE = exports.AMQP_COMPANIES_EXCHANGE = exports.AMQP_DELETE_TENANTS_QUEUE = exports.AMQP_CREATE_TENANTS_QUEUE = exports.AMQP_PRICING_DEAD_LETTER = exports.AMQP_TENANTS_EXCHANGE = exports.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES = exports.AMQP_PORT = exports.AMQP_PASSWORD = exports.AMQP_USERNAME = exports.AMQP_HOSTNAME = exports.HAULING_SERVICE_API_URL = exports.TRASH_API_URL = exports.RECYCLING_SERVICE_API_URL = exports.UMS_SERVICE_API_URL = exports.BILLING_SERVICE_API_URL = exports.SERVICE_SECRET_KEY_PASSPHRASE = exports.SERVICE_SECRET_KEY = exports.SERVICE_PUBLIC_KEY = exports.REDIS_PORT = exports.REDIS_HOST = exports.DB_PORT = exports.DB_DATABASE = exports.DB_PASSWORD = exports.DB_HOST = exports.DB_USER = void 0;
const dotenv = require("dotenv");
dotenv.config();
_a = process.env, exports.DB_USER = _a.DB_USER, exports.DB_HOST = _a.DB_HOST, exports.DB_PASSWORD = _a.DB_PASSWORD, exports.DB_DATABASE = _a.DB_DATABASE, exports.DB_PORT = _a.DB_PORT, exports.REDIS_HOST = _a.REDIS_HOST, exports.REDIS_PORT = _a.REDIS_PORT, exports.SERVICE_PUBLIC_KEY = _a.SERVICE_PUBLIC_KEY, exports.SERVICE_SECRET_KEY = _a.SERVICE_SECRET_KEY, exports.SERVICE_SECRET_KEY_PASSPHRASE = _a.SERVICE_SECRET_KEY_PASSPHRASE, exports.BILLING_SERVICE_API_URL = _a.BILLING_SERVICE_API_URL, exports.UMS_SERVICE_API_URL = _a.UMS_SERVICE_API_URL, exports.RECYCLING_SERVICE_API_URL = _a.RECYCLING_SERVICE_API_URL, exports.TRASH_API_URL = _a.TRASH_API_URL, exports.HAULING_SERVICE_API_URL = _a.HAULING_SERVICE_API_URL, exports.AMQP_HOSTNAME = _a.AMQP_HOSTNAME, exports.AMQP_USERNAME = _a.AMQP_USERNAME, exports.AMQP_PASSWORD = _a.AMQP_PASSWORD, exports.AMQP_PORT = _a.AMQP_PORT, exports.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES = _a.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, exports.AMQP_TENANTS_EXCHANGE = _a.AMQP_TENANTS_EXCHANGE, exports.AMQP_PRICING_DEAD_LETTER = _a.AMQP_PRICING_DEAD_LETTER, exports.AMQP_CREATE_TENANTS_QUEUE = _a.AMQP_CREATE_TENANTS_QUEUE, exports.AMQP_DELETE_TENANTS_QUEUE = _a.AMQP_DELETE_TENANTS_QUEUE, exports.AMQP_COMPANIES_EXCHANGE = _a.AMQP_COMPANIES_EXCHANGE, exports.AMQP_UPDATE_COMPANY_QUEUE = _a.AMQP_UPDATE_COMPANY_QUEUE, exports.AMQP_SKIP_SETUP = _a.AMQP_SKIP_SETUP, _b = _a.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS, exports.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS = _b === void 0 ? "update_subscription_order_status" : _b, exports.ELASTIC_URL = _a.ELASTIC_URL, exports.ELASTIC_PORT = _a.ELASTIC_PORT, exports.AUDIT_LOGS_ELASTIC_URL = _a.AUDIT_LOGS_ELASTIC_URL, exports.AUDIT_LOGS_ELASTIC_PORT = _a.AUDIT_LOGS_ELASTIC_PORT, _c = _a.NODE_ENV, exports.NODE_ENV = _c === void 0 ? "development" : _c, _d = _a.APP_NAME, exports.APP_NAME = _d === void 0 ? "pricing" : _d, _e = _a.LOG_LEVEL, exports.LOG_LEVEL = _e === void 0 ? "debug" : _e, _f = _a.SLOW_REQUEST_TIMEOUT, exports.SLOW_REQUEST_TIMEOUT = _f === void 0 ? 1000 : _f;
exports.LIGHT_LOGS = process.env.LIGHT_LOGS === "true";
exports.PRETTY_LOGS = process.env.PRETTY_LOGS === "true";
exports.LOGGING_HIDE = process.env.LOGGING_HIDE
    ? process.env.LOGGING_HIDE.split(",")
    : [
        "password",
        "newPassword",
        "token",
        "cookie",
        "authorization",
        "Authorization",
        "accessToken",
        "accessTokenExp",
        "refreshToken",
        "refreshTokenExp",
        "token",
        "code",
        "permissions",
    ];
exports.LOGGING_REMOVE = process.env.LOGGING_REMOVE ? process.env.LOGGING_REMOVE.split(",") : [];
exports.TRACING_HEADER = "x-amzn-trace-id";
exports.TRACING_PARAM = "reqId";
//# sourceMappingURL=config.js.map