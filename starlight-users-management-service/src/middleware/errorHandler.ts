import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-core';
import { Next } from 'koa';
import httpStatus from 'http-status';

import { Context } from '../context';

const hasErrorCode = (error: unknown): error is { status: number; statusCode: number } =>
  typeof error === 'object' && error !== null && ('status' in error || 'statusCode' in error);

// TODO: Do not use Apollo error classes.
export const errorHandlerMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  try {
    await next();
  } catch (error: unknown) {
    ctx.logger.error(error as Record<string, unknown>, 'Error during request processing');

    if (error instanceof ForbiddenError) {
      ctx.status = httpStatus.FORBIDDEN;
      ctx.body = { message: 'Unauthorized' };
    } else if (error instanceof UserInputError) {
      ctx.status = httpStatus.UNPROCESSABLE_ENTITY;
      ctx.body = { message: 'Validation error' };
    } else if (error instanceof AuthenticationError) {
      ctx.status = httpStatus.UNAUTHORIZED;
      ctx.body = { message: error.message };
    } else if (hasErrorCode(error)) {
      ctx.status = error.status || error.statusCode || 500;
      ctx.body = { message: 'Internal error' };
    } else {
      ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = { message: 'Internal error' };
    }
  }
};
