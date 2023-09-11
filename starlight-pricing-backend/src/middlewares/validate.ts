import Joi from 'joi';
import { Next } from 'koa';
import { Context } from '../Interfaces/Auth';
import { IBasicCustomError } from '../Interfaces/CustomError';
import ApiError from '../utils/ApiError';

export const validate =
  (schema: Joi.ObjectSchema<unknown>, reqPart: string = 'body') =>
  async (ctx: Context, next: Next) => {
    const dataToValidate = reqPart === 'params' ? ctx.params : ctx.request[reqPart];

    ctx.request.body = {};
    let validatedData;
    try {
      validatedData = await schema.validateAsync(dataToValidate, {
        stripUnknown: true,
        convert: true,
        context: undefined,
      });
    } catch (err: unknown) {
      const error = err as IBasicCustomError;
      throw ApiError.invalidRequest('Invalid request', error.details ?? error.message);
    }

    if (validatedData) {
      if (Array.isArray(validatedData)) {
        if (!Array.isArray(ctx.request.body)) {
          ctx.request.body = Array.from(validatedData);
        }
        ctx.request.body = validatedData;
      }
      Object.assign(ctx.request.body, validatedData);
    }
    await next();
  };
