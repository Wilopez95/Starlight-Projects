import { ParameterizedContext, DefaultContext } from 'koa';
import { IRouterParamContext } from 'koa-router';
import { AccessTokenData } from '../modules/auth/tokens';
import Me from './Me';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppState {}

export interface CustomContext extends DefaultContext {
  token: string;
  userInfo: Me;
  tokenData?: AccessTokenData;
  resource: string;
  reqId: string;
}

export type Context = ParameterizedContext<
  AppState,
  IRouterParamContext<AppState, unknown> & CustomContext
>;
