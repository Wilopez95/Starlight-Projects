import env from 'dotenv';
import packageJson from '../package.json';
import { parseDuration } from './utils/durations';

env.config();

export const {
  APP_NAME = 'ums',
  API_HOST = 'localhost:3002',
  LOG_PATH,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_COGNITO_USER_POOL_ID,
  AWS_COGNITO_CLIENT_ID,
  AWS_COGNITO_CLIENT_SECRET,
  AWS_COGNITO_DOMAIN,
  API_ROOT = '/api/ums',
  API_PORT = 3002,
  NODE_ENV = 'development',
  AWS_COGNITO_REGION = 'us-east-1',
  TOKEN_COOKIE = 'identitytoken',
  SESSION_COOKIE = 'sessioncookie',
  REFRESH_TOKEN_LIFETIME = '30d',
  RESOURCE_TOKEN_LIFETIME = '2h',
  TOKEN_SECRET,
  REDIS_URL,
  EMIT_GRAPHQL_SCHEMA,
  AMQP_HOSTNAME,
  AMQP_USERNAME,
  AMQP_PASSWORD,
  AMQP_PORT,
  AMQP_UMS_DEAD_LETTER = 'ums.dead.letter',
  AMQP_TENANTS_EXCHANGE = 'tenants.updates',
  AMQP_BUSINESS_UNITS_EXCHANGE = 'business-units.updates',
  AMQP_LOGOUT_EXCHANGE = 'users.logout',
  AMQP_QUEUE_BUSINESS_UNITS = 'business_units',
  AMQP_HISTORY_EXCHANGE = 'history',
  AMQP_CUSTOMER_CONTACTS_QUEUE = 'customers.contacts.updates',
  USE_HTTPS = 'true',

  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,

  AUDIT_LOGS_ELASTIC_URL,
  AUDIT_LOGS_ELASTIC_PORT = 443,
  THREADS_COUNT = 3,
  DD_VERSION = packageJson.version,
  SENTRY_ENABLED = 'false',
  SENTRY_DSN,
  ENV_NAME = 'prod',
  SENTRY_DEBUG = 'false',
  LOG_LEVEL,
  DD_API_KEY = '',
  DD_LOGS_INJECTION = 'false',
} = process.env;

export const USER_IDENTITY_SESSION_MAX_AGE = parseDuration('30d');

export const TRACING_HEADER = 'x-amzn-trace-id';
export const TRACING_PARAM = 'reqId';

export const API_BASE = `http${USE_HTTPS === 'false' ? '' : 's'}://${API_HOST}`;
export const API_URL = new URL(API_ROOT, API_BASE).toString();

export const PRETTY_LOGS = process.env.PRETTY_LOGS === 'true';
export const REQUIRE_TENANT_SYNC = process.env.REQUIRE_TENANT_SYNC === 'true';
export const LIGHT_LOGS = process.env.LIGHT_LOGS === 'true';
