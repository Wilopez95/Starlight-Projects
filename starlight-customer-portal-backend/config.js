import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

export const {
  ENV_NAME,
  NODE_ENV = 'production',

  PORT = 3001,
  API_ROOT = '/api/customer-portal',
  HAULING_URL,
  UMS_URL,
  BILLING_URL,
  API_HOST,
  FRONTEND_URL,
  TENANT_NAME,
  TOKEN_COOKIE = 'identitytoken',

  PRETTY_LOGS,
  LIGHT_LOGS = false,
  SLOW_REQUEST_TIMEOUT = 1000,
  LOG_LEVEL,

  TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN = '5h',

  REDIS_HOST,
  REDIS_PORT = '6379',

  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,
} = process.env;

export const TRACING_HEADER = 'x-amzn-trace-id';
export const TRACING_PARAM = 'reqId';
export const LOBBY_RESOURCE = 'srn:global:global:lobby';
export const CONFIGURATION_RESOURCE = 'srn:global:global:configuration';

export const PERMISSION_REGEXP = /([\s\w:\d-_]+)(\(.+\))?/;

export const LOGGING_HIDE = process.env.LOGGING_HIDE
  ? process.env.LOGGING_HIDE.split(',')
  : ['password', 'newPassword', 'token', 'cookie', 'authorization'];
export const LOGGING_REMOVE = process.env.LOGGING_REMOVE
  ? process.env.LOGGING_REMOVE.split(',')
  : [];
