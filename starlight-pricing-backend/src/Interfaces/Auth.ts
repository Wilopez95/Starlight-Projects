import { type ParameterizedContext, type Request } from 'koa';
import type Router from '@koa/router';
import { Logger } from 'pino';

export enum AccessLevel {
  NO_ACCESS = 'NO_ACCESS',
  READ = 'READ',
  MODIFY = 'MODIFY',
  FULL_ACCESS = 'FULL_ACCESS',
}
export interface AccessConfig {
  level: AccessLevel;
  overridden?: boolean;
}

export interface AccessMap {
  [subject: string]: AccessConfig;
}
export interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  access: AccessMap;
  firstName?: string;
  lastName?: string;
  tenantId?: number;
  tenantName?: string;
  resource?: string;
  subscriberName?: string;
  schemaName?: string;
  userId?: string;
  customerId?: string | number;
  contactId?: string | number;
}
export interface IUser {
  id?: number | string;
  permissions?: string[];
  availableActions?: string | string[];
  tenantName?: string;
  email?: string;
  userId?: string;
  resource?: string;
  subscriberName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  schemaName?: string;
  tenantId?: number;
}

export interface IUserTokenData extends UserInfo {
  umsAccessToken?: string;
  userInfo: UserInfo;
}

export interface IServiceToken {
  requestId?: string;
  audience?: string;
  subject?: string;
  issuer?: string;
  schemaName?: string;
  tenantName?: string;
  id?: number;
}
export interface IContent {
  userTokenData: IUserTokenData | undefined;
  user: IUser;
  serviceToken: IServiceToken | undefined;
  reqId?: string;
  logger: Logger;
  skipBodyLogging: unknown | undefined;
  models?: unknown;
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

export interface IRequestQuery {
  limit?: number | null;
  skip?: number | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  finalizedOnly?: string | null;
  businessUnitId?: number | null;
  mine?: boolean | null;
  status?: string | null;
  query?: string | null;
}

export interface IFile {
  name: string;
  size: number;
  type: string;
  extension: string;
  content: ArrayBuffer;
}

export interface ContextExtensions {
  status: number;
  logger: Logger;
  router: Router;
  userInfo?: UserInfo;
  params: Record<string, string>;
  request: Request & {
    body?: UserInfo;
    headers: Record<string, unknown>;
    files?: IFile[];
    query: IRequestQuery;
  };
  reqId: string;
  serviceToken?: ServiceToken;
  state: IContent;
  headers: { [key: string]: string };
  sendArray: (key?: unknown) => Function | undefined;
  user?: IUser;
  models?: unknown;
}
export type AppState = Record<string, unknown>;
export type Context = ParameterizedContext<AppState, ContextExtensions>;

export interface IProceedToken {
  tokenId: string;
  existingTokenData?: IUserTokenData;
  dontCheck?: boolean;
}

export interface IFormattersLogger {
  method?: string;
  origin?: string;
  path?: string;
  status?: number;
  search?: string;
  took?: string;
  url?: string;
}

export interface IFormattersResponseLogger {
  method?: string;
  origin?: string;
  path?: string;
  status?: number;
  search?: string;
  took?: string;
  url?: string;
  level?: string;
  content: unknown;
}

export interface IMakeRequest {
  version?: number;
  token?: string;
  serviceToken?: string;
  headers?: { [key: string]: string };
  'x-amzn-trace-id'?: string;
  method?: 'post' | 'put' | 'get' | 'delete' | 'patch';
  url?: string;
  data?: unknown;
}

export interface IMakeRequestheaders {
  [key: string]: string | undefined;
}
