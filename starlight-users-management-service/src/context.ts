import { type ParameterizedContext, type Request } from 'koa';
import type Router from '@koa/router';
import { Logger } from 'pino';
import { type AccessMap } from './entities/Policy';

export interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  access: AccessMap;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  tenantName?: string;
  resource?: string;
}

export interface ServiceToken {
  aud: string;
  exp: string;
  iat: string;
  iss: string;
  jti: string;
  kid: string;
  sub: string;

  [key: string]: unknown;
}

export interface ContextExtensions {
  logger: Logger;
  router: Router;
  userInfo?: UserInfo;
  params: Record<string, string>;
  request: Request & {
    body: Record<string, unknown>;
    headers: Record<string, unknown>;
  };
  reqId: string;
  serviceToken?: ServiceToken;
}

export type AppState = Record<string, unknown>;
export type Context = ParameterizedContext<AppState, ContextExtensions>;
export type ResolverContext = ParameterizedContext<AppState, ContextExtensions>;
