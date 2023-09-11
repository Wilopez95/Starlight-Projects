import { MiddlewareFn } from 'type-graphql';
import { QueryContext } from '../../types/QueryContext';

export const isAuthenticated: MiddlewareFn<QueryContext> = async ({ context }, next) => {
  if (!context.token) {
    throw new Error('You need to be authenticated to use this resource.');
  }

  return next();
};
