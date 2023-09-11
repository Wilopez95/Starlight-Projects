import { AuthenticationError } from 'apollo-server-core';
import { MiddlewareFn } from 'type-graphql';

import { Context } from '../../context';

export const authenticatedOnly: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!context.userInfo) {
    throw new AuthenticationError('You must be signed in');
  }

  await next();
};
