import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export const {
  NODE_ENV = 'production',
  DEBUG,
  UMS_URL,
  DISPATCH_URL,
  DRIVER_URL,
  API_HOST,
  ROUTE_PLANNER_URL,

  MAPBOX_ACCESS_TOKEN,
  MAPS_API_KEY,

  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,

  HAULING_URL,
  HAULING_HEADERS_SEND_KEY,
  HAULING_HEADERS_SEND_VALUE,
  HAULING_HEADERS_GET_KEY,
  HAULING_HEADERS_GET_VALUE,

  DB_HOST,
  DB_PORT = 5432,
  DB_USER,
  DB_NAME,
  DB_PASSWORD,
  DB_DIALECT = 'postgres',
  DB_CLIENT = 'pg',
  MIGRATIONS_TIMEOUT = 1000,
  SCHEMA_FOR_TEST = 'trash_test',

  REDIS_HOST,
  REDIS_PORT = 6379,

  PORT = 3000,
  API_PATH = '/trashapi',

  TWILIO_ID,
  TWILIO_TOKEN,
  TWILIO_MSG_SVC_ID,
  PDF_API_URL,
  PDF_API_KEY,

  AWS_REGION,
  AWS_BUCKET,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_SNS_IOS,
  AWS_SNS_ANDROID,

  SENTRY_DSN,

  LOGS_LEVEL = 'info',
  SLOW_REQUEST_TIMEOUT = 1000,

  AMQP_HOST,
  AMQP_PORT,
  AMQP_USER,
  AMQP_PASSWORD,

  AMQP_TENANTS_EXCHANGE,
  AMQP_DISPATCH_DEAD_LETTER,
  AMQP_CREATE_TENANTS_QUEUE,
  AMQP_DELETE_TENANTS_QUEUE,
  AMQP_COMPANIES_EXCHANGE,
  AMQP_UPDATE_COMPANY_QUEUE,
  ENV_NAME = 'prod',
  DD_API_KEY = '',
  DD_LOGS_INJECTION = 'false',
  LOG_LEVEL,
} = process.env;

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
export const LIGHT_LOGS = process.env.LIGHT_LOGS === 'true';
export const PRETTY_LOGS = process.env.PRETTY_LOGS === 'true';
export const ENABLE_DATADOG = process.env.ENABLE_DATADOG === 'true';
export const SENTRY_ENABLE = process.env.SENTRY_ENABLE === 'true';
export const USE_MAPBOX_PERMANENT_ENDPOINT = process.env.USE_MAPBOX_PERMANENT_ENDPOINT === 'true';
export const TRACING_HEADER = 'x-amzn-trace-id';
export const TRACING_PARAM = 'reqId';
export const LOBBY_RESOURCE = 'srn:global:global:lobby';

const argvConfig = {
  SKIP_MIGRATION: 'skip-migration',
  SKIP_MQ_SETUP: 'skip-mq-setup',
};

const argvFlags = Object.entries(argvConfig).reduce((acc, [key, flag]) => {
  acc[key] = process.argv.includes(`--${flag}`);
  return acc;
}, {});

export const { SKIP_MIGRATION, SKIP_MQ_SETUP } = argvFlags;
