import * as dotenv from 'dotenv';
dotenv.config();
export const {
  DB_USER,
  DB_HOST,
  DB_PASSWORD,
  DB_DATABASE,
  DB_PORT,
  DB_LOGGING = '',
  REDIS_HOST,
  REDIS_PORT,
  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,
  BILLING_SERVICE_API_URL,
  UMS_SERVICE_API_URL,
  RECYCLING_SERVICE_API_URL,
  TRASH_API_URL,
  HAULING_SERVICE_API_URL,

  AMQP_HOSTNAME,
  AMQP_USERNAME,
  AMQP_PASSWORD,
  AMQP_PORT,
  AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES,

  AMQP_TENANTS_EXCHANGE,
  AMQP_PRICING_DEAD_LETTER,
  AMQP_CREATE_TENANTS_QUEUE,
  AMQP_DELETE_TENANTS_QUEUE,
  AMQP_COMPANIES_EXCHANGE,
  AMQP_UPDATE_COMPANY_QUEUE,
  AMQP_SKIP_SETUP,

  AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS = 'update_subscription_order_status',
  ELASTIC_URL,
  ELASTIC_PORT,
  AUDIT_LOGS_ELASTIC_URL,
  AUDIT_LOGS_ELASTIC_PORT,
  NODE_ENV = 'development',
  APP_NAME = 'pricing',
  LOG_LEVEL = 'error',
  SLOW_REQUEST_TIMEOUT = 1000,
} = process.env;

export const LIGHT_LOGS = process.env.LIGHT_LOGS === 'true';
export const PRETTY_LOGS = process.env.PRETTY_LOGS === 'true';

export const LOGGING_HIDE = process.env.LOGGING_HIDE
  ? process.env.LOGGING_HIDE.split(',')
  : [
      'password',
      'newPassword',
      'token',
      'cookie',
      'authorization',
      'Authorization',
      'accessToken',
      'accessTokenExp',
      'refreshToken',
      'refreshTokenExp',
      'token',
      'code',
      'permissions',
    ];

export const LOGGING_REMOVE = process.env.LOGGING_REMOVE
  ? process.env.LOGGING_REMOVE.split(',')
  : [];

export const TRACING_HEADER = 'x-amzn-trace-id';
export const TRACING_PARAM = 'reqId';
