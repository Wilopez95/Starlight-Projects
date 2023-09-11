import path from 'path';
import { readFileSync } from 'fs';

import dotenv from 'dotenv';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

const pkgJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json')));

export const {
  ENV_NAME = 'prod',
  FE_HOST,
  NODE_ENV = 'production',

  PORT = 3001,
  API_ROOT = '/api/billing',
  GRAPHQL_PATH = '/api/billing/graphql',
  PLAYGROUND_PATH = '/api/billing/playground',

  PLAYGROUND_USER,
  PLAYGROUND_PASSWORD,

  SLOW_REQUEST_TIMEOUT = 1000,
  LOG_LEVEL,
  AUDIT_LOG_AS_SEPARATE_PROCESS = false,

  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT = 5432,
  DB_NAME,

  DB_REMOTE_CORE_NAME,
  DB_REMOTE_CORE_HOST,
  DB_REMOTE_CORE_PORT,
  DB_REMOTE_CORE_USER,
  DB_REMOTE_CORE_PASSWORD,

  DB_REMOTE_PRICING_NAME,
  DB_REMOTE_PRICING_HOST,
  DB_REMOTE_PRICING_PORT,
  DB_REMOTE_PRICING_USER,
  DB_REMOTE_PRICING_PASSWORD,

  AUDIT_LOGS_ELASTIC_URL,
  AUDIT_LOGS_ELASTIC_PORT = 443,

  HAULING_SERVICE_URL,
  UMS_SERVICE_API_URL,
  PRICING_SERVICE_API_URL = 'https://dev3.backend-pricing.starlightpro.net', //JUST FOR TEST, DELETE LATER. -> wlopez

  CARDCONNECT_URL,
  FLUIDPAY_URL,

  EXAGO_URL,
  EXAGO_TOKEN,

  SENDGRID_SMTP_API_KEY_ID,
  SENDGRID_WEBHOOK_PUBLIC_KEY,

  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET,

  AMQP_HOSTNAME,
  AMQP_PORT,
  AMQP_USERNAME,
  AMQP_PASSWORD,

  AMQP_QUEUE_CUSTOMER_BALANCES,
  AMQP_QUEUE_CUSTOMER_OLDEST_UNPAID_INVOICE_DATE = 'customer_oldest_unpaid_invoice_date',
  AMQP_QUEUE_ORDER_TOTALS_TO_BILLING,
  AMQP_QUEUE_REQUEST_SETTLEMENTS,
  AMQP_QUEUE_DISPATCH_ORDERS,
  AMQP_QUEUE_CHARGE_DEFERRED_PAYMENTS,
  AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
  AMQP_QUEUE_LOCK_BANK_DEPOSITS,
  AMQP_QUEUE_BUSINESS_UNITS,
  AMQP_QUEUE_JOB_SITES_TO_BILLING,
  AMQP_QUEUE_CUSTOMERS_TO_BILLING,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
  AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
  AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
  AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING,
  AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
  AMQP_QUEUE_BUSINESS_LINES,
  AMQP_QUEUE_AUTO_PAY_INVOICES,
  AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS,
  AMQP_HISTORY_USERS_TOPIC,
  AMQP_QUEUE_SUBSCRIPTION_HISTORY_ADD_INVOICE,
  AMQP_QUEUE_SUBSCRIPTION_HISTORY_ADD_PAYMENT,

  AMQP_HISTORY_EXCHANGE,
  AMQP_TENANTS_EXCHANGE,
  AMQP_COMPANIES_DATA_EXCHANGE,
  AMQP_BILLING_DEAD_LETTER,

  PDF_GENERATION_BATCH_SIZE = 30,
  WRITE_OFF_DIFFERENCE_IN_HOURS,

  REDIS_HOST,
  REDIS_PORT = '6379',

  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,

  NOTIFICATIONS_EMAIL = 'Starlight Notifications <notify@mail.starlightsoftware.io>',
  PASSWORD_HASHING_ROUNDS,

  CRPT_FEATURES_OFF = false,
  MID_ENCRYPTION_KEY,

  START_QB_SOAP_SERVER = false,

  DD_VERSION = pkgJson.version,
  DD_LOGS_INJECTION = 'false',
  SENTRY_ENABLED = 'false',
  SENTRY_DSN,
  SENTRY_DEBUG = 'false',
  EMAIL_SANDBOX = 'true',
  DD_API_KEY = '',
} = process.env;

export const LIGHT_LOGS = process.env.LIGHT_LOGS === 'true';
export const PRETTY_LOGS = process.env.PRETTY_LOGS === 'true';

export const TRACING_HEADER = 'x-amzn-trace-id';
export const TRACING_PARAM = 'reqId';

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

export const AUTHORIZATION_AMOUNT = Number.parseFloat(process.env.AUTHORIZATION_AMOUNT);

export const PLAYGROUND_ALLOWED = ['local', 'dev1', 'dev2', 'dev3'].includes(ENV_NAME);

const argvConfig = {
  SKIP_MIGRATION: 'skip-migration',
  SKIP_MQ_SETUP: 'skip-mq-setup',
  GENERATE_SNAPSHOTS: 'generate-snapshots',
};

const argvFlags = Object.entries(argvConfig).reduce((acc, [key, flag]) => {
  acc[key] = process.argv.includes(`--${flag}`);
  return acc;
}, {});

export const { SKIP_MIGRATION, SKIP_MQ_SETUP, GENERATE_SNAPSHOTS } = argvFlags;

export const GLOBAL_SCHEMA_KEY = 'global';

export const MOCKED_USER_TOKEN_ID = process.env.MOCKED_USER_TOKEN_ID
  ? process.env.MOCKED_USER_TOKEN_ID.trim()
  : null;

export const MOCKED_USER_TOKEN_DATA = process.env.MOCKED_USER_TOKEN_DATA
  ? JSON.parse(process.env.MOCKED_USER_TOKEN_DATA.trim())
  : null;
