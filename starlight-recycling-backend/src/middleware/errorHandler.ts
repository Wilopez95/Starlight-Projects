import { AuthenticationError, UserInputError } from 'apollo-server-koa';
import { Next } from 'koa';
import httpStatus from 'http-status';
// import {  } from 'http-errors';

import { Context } from '../types/Context';

// TODO: Do not use Apollo error classes.
export const errorHandlerMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  try {
    await next();
  } catch (error) {
    if (error.statusCode) {
      ctx.status = error.statusCode;
      ctx.body = { message: error.message };

      return;
    }

    if (error instanceof AuthenticationError) {
      ctx.status = httpStatus.UNAUTHORIZED;
      ctx.body = { message: 'Unauthorized' };
    } else if (error instanceof UserInputError) {
      ctx.status = httpStatus.UNPROCESSABLE_ENTITY;
      ctx.body = { message: 'Validation error' };
    } else {
      ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = { message: 'Internal error' };
    }
  }
};
