import env from 'dotenv';
import url from 'url';
import { isString } from 'lodash';
import { ConnectionOptions } from 'typeorm';
import { ConnectionOptionsEnvReader } from 'typeorm/connection/options-reader/ConnectionOptionsEnvReader';

env.config();

// TODO remove this hack
process.env.TYPEORM_ENTITIES = undefined;

export const {
  APP_NAME = 'recycling',
  FRONTEND_HOST = 'localhost',
  CORE_FRONTEND_HOST,
  ADMIN_FRONTEND_HOST = 'localhost:8001',
  API_HOST = 'localhost',
  NODE_ENV = 'development',
  LOG_PATH = 'logs',
  STATIC_BUCKET = 'recycling-dev-front-end',
  STATIC_BUCKET_REGION = 'eu-west-1',
  REDIS_HOST,
  REDIS_PORT = '6379',
  SENDGRID_SMTP_API_KEY_ID,
  SENDGRID_SENDER_EMAIL = 'Starlight Pro <notify@starlightpro.com>',
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_ADMINISTRATIVE_TILESET_ID = 'starlightpro.administrative_us',
  ELASTICSEARCH_PROTOCOL = 'https:',
  ELASTICSEARCH_HOST,
  ELASTICSEARCH_PORT = '9200',
  RABBITMQ_HOSTNAME,
  RABBITMQ_PASSWORD,
  RABBITMQ_USERNAME,
  RABBITMQ_PORT = '5672',
  ACCESS_TOKEN_EXPIRES_IN = '5h',
  ACCESS_TOKEN_SECRET = '23reesdffds',
  EMIT_GRAPHQL_SCHEMA,
  AWS_S3_ACCESS_KEY_ID,
  AWS_REGION = 'ca-central-1',
  AWS_S3_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET,
  AWS_S3_REGION,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOULD_NAME,
  IMAGES_PROJECT_FOLDER = 'recycling',
  FILES_PROJECT_FOLDER = 'files',
  S3_AS_MEDIA_STORAGE = false,
  CARDCONNECT_URL,
  CARDCONNECT_MID,
  CARDCONNECT_USERNAME,
  CARDCONNECT_PASSWORD,
  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,
  UMS_SERVICE_API_URL,
  CORE_SERVICE_API_URL,
  BILLING_SERVICE_API_URL,
  BILLING_TENANTS_QUEUE = 'tenants.updates.billing',
  AMQP_QUEUE_BUSINESS_UNITS = 'business_units_to_recycling',
  AMQP_QUEUE_COMPANIES = 'companies',
  AMQP_QUEUE_JOB_SITES_TO_BILLING = 'job_sites',
  AMQP_QUEUE_CUSTOMERS_TO_BILLING = 'customers',
  AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING = 'customer_job_site_to_billing',
  AMQP_QUEUE_ORDER_TOTALS_TO_BILLING = 'order_totals_to_billing',
  AMQP_QUEUE_TRUCK_ON_WAY = 'work_orders_to_recycling',
  AMQP_BUSINESS_UNITS_EXCHANGE = 'business-units.updates',
  AMQP_QUEUE_WORK_ORDERS_TO_CORE = 'work_orders_from_recycling',
  AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING = 'invoiced_orders_to_recycling',
  AMQP_LOGOUT_EXCHANGE = 'users.logout',
  AMQP_QUEUE_LOGOUT = 'logout.updates',
  TYPEORM_CONNECTION_TIMEOUT_MS = 10000,
  WORKERS_PORT = 5001,
  ELASTICSEARCH_DISABLE_SSL = false,
  DD_TRACE_ENABLED = 'false',
  DD_TRACE_DEBUG = 'false',
  DD_TRACING_ENABLED = 'false',
  DD_VERSION = '1.0.0',
  DD_ENV = 'production',
  DD_LOGS_INJECTION = 'false',
  DD_RUNTIME_METRICS_ENABLED = 'false',
  DD_PROFILING_ENABLED = 'false',
  DD_TAGS,
  SENTRY_ENABLED = 'false',
  SENTRY_DSN,
  SENTRY_ENVIRONMENT = DD_ENV,
  SENTRY_DEBUG = 'false',
} = process.env;

// 75 minutes
export const WEIGHT_TICKET_PRESIGNED_URL_EXPIRATION = 60 * 75;
/**
 * regenerate presigned url if expiration is less than 30 minutes
 */
export const WEIGHT_TICKET_PRESIGNED_URL_REGENERATE_THRESHOLD = 60 * 30;
export const PRESIGNED_URL_CACHE_KEY_PREFIX = 'reycling:presignedUrl:';
export const ELASTICSEARCH_POPULATE_INDEX_PER_PAGE =
  Number(process.env.ELASTICSEARCH_POPULATE_INDEX_PER_PAGE) || 50;

export const ENV = NODE_ENV;
export const IS_HTTPS = ENV !== 'development';
export const HTTP_PROTOCOL = `http${IS_HTTPS ? 's' : ''}`;

export let { API_PORT = 3000 } = process.env;

if (isString(API_PORT)) {
  try {
    API_PORT = parseInt(API_PORT);
  } catch {}
}

const parsedHost = url.parse(`http://${API_HOST}`);

if (parsedHost.port && parsedHost.port !== API_PORT) {
  try {
    API_PORT = parseInt(parsedHost.port);
  } catch {}
}

if (!API_PORT) {
  API_PORT = 3000;
}

export const CONFIG = {
  ENV,
  API_HOST,
  API_PORT,
  LOG_PATH,
};

export const readTypeORMEnvConfig = (): Promise<ConnectionOptions> =>
  new ConnectionOptionsEnvReader().read().then((configs) => ({
    migrationsTransactionMode: (process.env.TYPEORM_MIGRATIONS_TRANSACTION_MODE || 'each') as
      | 'all'
      | 'none'
      | 'each',
    ...configs[0],
  }));

export const LOBBY_HOST = 'localhost';

export const FRONTEND_URL = `${HTTP_PROTOCOL}://${FRONTEND_HOST}`;
export const API_URL = `${HTTP_PROTOCOL}://${API_HOST}/api`;
export const IS_LOCAL_DEVELOPMENT =
  NODE_ENV === 'development' && FRONTEND_HOST.includes('localhost');

export const TRACING_HEADER = 'x-amzn-trace-id';
export const TRACING_PARAM = 'reqId';

export const {
  OIDC_AUTH_URL = `${API_URL}/oauth2/auth`,
  OIDC_TOKEN_URL = `${API_URL}/oauth2/token`,
} = process.env;

export default CONFIG;

export const WEBSOCKET_PORT = 3010;
export const WS_CONNECTION_REPEAT_COUNT = 2;
export const WS_CONNECTION_TIMEOUT_DELAY = 2000;
export const WS_CONNECTION_SEPARATOR = '///';
export const WS_CONNECTION_PATH = '/api/ws/printnode';
