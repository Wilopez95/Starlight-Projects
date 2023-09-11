import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export const {
  ENV_NAME = 'prod',
  FE_HOST,
  NODE_ENV = 'production',

  PORT = 3001,
  API_ROOT = '/api/route-planner',
  GRAPHQL_PATH = '/api/route-planner/graphql',
  PLAYGROUND_PATH = '/api/route-planner/playground',

  PLAYGROUND_USER,
  PLAYGROUND_PASSWORD,

  SLOW_REQUEST_TIMEOUT = 1000,
  LOG_LEVEL,

  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT = 5432,
  DB_NAME,

  TOKEN_SECRET,
  TOKEN_COOKIE = 'identitytoken',

  EXAGO_URL,
  EXAGO_TOKEN,

  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET,
  S3_AS_MEDIA_STORAGE = false,

  AMQP_HOSTNAME,
  AMQP_PORT,
  AMQP_USERNAME,
  AMQP_PASSWORD,

  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOULD_NAME,
  CLOUDINARY_PROJECT_FOLDER,

  AUDIT_LOGS_ELASTIC_URL,
  AUDIT_LOGS_ELASTIC_PORT,
  NO_AUDIT_LOG,

  AMQP_QUEUE_BUSINESS_UNITS,
  AMQP_TENANTS_EXCHANGE,
  AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH,
  AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER,
  AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH,
  AMQP_QUEUE_RECYCLING_ORDERS_TO_ROUTE_PLANNER,

  AMQP_QUEUE_PUBLISH_MASTER_ROUTE,
  AMQP_QUEUE_DAILY_ROUTES_GENERATION,

  DAILY_ROUTES_PUBLISH_MAX_OFFSET,
  WOS_SYNC_MAX_BATCH_SIZE,
  SUBSCRIPTION_SERVICE_ITEMS_SYNC_MAX_BATCH_SIZE,

  REDIS_HOST,
  REDIS_PORT = '6379',

  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,

  HAULING_SERVICE_API_URL,
  BILLING_SERVICE_API_URL,
  RECYCLING_SERVICE_API_URL,
  PRICING_SERVICE_API_URL = 'https://dev3.backend-pricing.starlightpro.net/api/pricing',

  NOTIFICATIONS_EMAIL = 'notify@starlightsoftware.io',
  DD_API_KEY = '',
  DD_LOGS_INJECTION = 'false',
  SENTRY_ENABLED = 'false',
  SENTRY_DSN,
  DD_VERSION = '1.9.0',
} = process.env;

export const LIGHT_LOGS = process.env.LIGHT_LOGS === 'true';
export const PRETTY_LOGS = process.env.PRETTY_LOGS === 'true';

export const TRACING_HEADER = 'x-amzn-trace-id';
export const TRACING_PARAM = 'reqId';

export const PERMISSION_REGEXP = /([\s\w:\d-_]+)(\(.+\))?/;

export const LOGGING_HIDE = process.env.LOGGING_HIDE
  ? process.env.LOGGING_HIDE.split(',')
  : [
      'password',
      'newPassword',
      'token',
      'cookie',
      'authorization',
      'cardNumber',
      'cvv',
      'nameOnCard',
      'cardNickname',
      'cardNumberLastDigits',
      'ccAccountToken',
    ];
export const LOGGING_REMOVE = process.env.LOGGING_REMOVE
  ? process.env.LOGGING_REMOVE.split(',')
  : [];

export const PLAYGROUND_ALLOWED = ['local', 'dev1', 'dev2', 'dev3'].includes(ENV_NAME);

const argvConfig = {
  SKIP_MIGRATION: 'skip-migration',
  SKIP_MQ_SETUP: 'skip-mq-setup',
};

const argvFlags = Object.entries(argvConfig).reduce((acc, [key, flag]) => {
  acc[key] = process.argv.includes(`--${flag}`);
  return acc;
}, {});

export const { SKIP_MIGRATION, SKIP_MQ_SETUP } = argvFlags;
export const WEEK_STARTS_FROM_SUNDAY = false;

export const MOCKED_USER_TOKEN_ID = process.env.MOCKED_USER_TOKEN_ID
  ? process.env.MOCKED_USER_TOKEN_ID.trim()
  : null;

export const MOCKED_USER_TOKEN_DATA = process.env.MOCKED_USER_TOKEN_DATA
  ? JSON.parse(process.env.MOCKED_USER_TOKEN_DATA.trim())
  : null;

export const MOCKED_USER_INFO = process.env.MOCKED_USER_INFO
  ? JSON.parse(process.env.MOCKED_USER_INFO.trim())
  : null;
