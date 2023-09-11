import ApplicationError from '../errors/ApplicationError.js';

const validate =
  (schema, reqPart = 'body', getContext) =>
  async (ctx, next) => {
    const dataToValidate = reqPart === 'params' ? ctx.params : ctx.request[reqPart];

    if (!ctx.request.validated) {
      ctx.request.validated = {
        body: {},
        query: {},
        params: {},
      };
    }

    try {
      const validatedData = await schema.validateAsync(dataToValidate, {
        stripUnknown: true,
        convert: true,
        context: typeof getContext === 'function' ? getContext() : undefined,
      });
      if (Array.isArray(validatedData)) {
        if (!Array.isArray(ctx.request.validated[reqPart])) {
          ctx.request.validated[reqPart] = Array.from(ctx.request.validated[reqPart]);
        }
        ctx.request.validated[reqPart] = ctx.request.validated[reqPart].concat(validatedData);
      } else {
        Object.assign(ctx.request.validated[reqPart], validatedData);
      }
    } catch (err) {
      throw ApplicationError.invalidRequest(undefined, err.details || err.message);
    }

    await next();
  };

export default validate;
