import { AxiosError } from 'axios';
import { ApolloError } from 'apollo-server-koa';
import { QueryContext } from '../../../../../types/QueryContext';

export function coreErrorHandler(ctx: Pick<QueryContext, 'log'>, e: AxiosError): never {
  ctx.log.error(e.response?.data || e, e.message);

  if (!e.response?.data) {
    throw e;
  }

  throw new ApolloError(e.response.data.message, e.response.data.code, {
    errors: e.response.data.details,
  });
}
