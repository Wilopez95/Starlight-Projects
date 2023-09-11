import ApiError from '../errors/ApiError.js';

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

    let validatedData;
    try {
      validatedData = await schema.validateAsync(dataToValidate, {
        stripUnknown: true,
        convert: true,
        context: typeof getContext === 'function' ? getContext() : undefined,
      });
    } catch (err) {
      throw ApiError.invalidRequest(undefined, err.details || err.message);
    }

    if (validatedData) {
      if (Array.isArray(validatedData)) {
        if (!Array.isArray(ctx.request.validated[reqPart])) {
          ctx.request.validated[reqPart] = Array.from(ctx.request.validated[reqPart]);
        }
        ctx.request.validated[reqPart] = ctx.request.validated[reqPart].concat(validatedData);
      }
      Object.assign(ctx.request.validated[reqPart], validatedData);
    }

    await next();
  };

export default validate;
